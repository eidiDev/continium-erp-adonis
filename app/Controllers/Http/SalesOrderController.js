'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with salesorders
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/SalesOrder");
const Kit = use("App/Models/Kit");
const ListaPedidoFox = use("App/Models/Listapedidofox");
const OrderProd = use("App/Models/OrderProd");
const stepXprod = use("App/Models/Stepxprod");

const fs = require('fs')
const pdf = require('html-pdf');
const moment = require('moment');

class SalesOrderController extends ScaffoldController {
  constructor() {
    super();
    this.resource = {model}
  }

  async store({request,response}) {
    const campos = request.all();
    const linPd = campos.linhasPd;
    
    delete campos.linhasPd;

    if(linPd.length === 0) {
    }else{
      for (const iterator of linPd) {
        delete iterator.key
        delete iterator.orderprod
        delete iterator.productObj
      }
    }

    const recordCreated = await this.resource.model.create(
      campos
    );

    //const salesOrder = await this.resource.model.find(recordCreated.id);

    try {
      if(linPd.length === 0){
      }else{
        const lins = await recordCreated
        .linhas()
        .createMany(linPd);
      }
 
      const salesOrder = await this.resource.model
      .query()
      .with('linhas', (lin) => lin.with('orderprod', (orderprod) => orderprod.with('productObj')).with('productObj'))
      .with('partner')
      .where('id', recordCreated.id).fetch();

      return salesOrder
    } catch (error) {
      console.log(error)
    }
    
    //return res.status(200).json(lins)
  }
 
  async index({ request, response }) {
    let { page, limit } = request.only(['page', 'limit']);

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 50;
    }

    const listResponse = await this.resource.model
      .query()
      .select(this.resource.model.visible)
      .with('partner')
      .with('linhas', (lin) => lin.with('orderprod').with('productObj'))
      .paginate(page, limit);

    return response.json(listResponse);
  }

  async show({ request, response }) {
    const { id } = request.params;

    const record = await this.resource.model
    .query()
    .with('linhas', (lin) => lin.with('orderprod', (orderprod) => orderprod.with('productObj')).with('productObj'))
    .with('partner')
    .where('id', id)
    .fetch();

    this.resource.model.with && (await record.load(this.resource.model.with));

    if (!record) {
      return response.status(404).json({ error: 'Registro não encontrada' });
    }

    return response.json(record);
  }

  async postpdf({request,response}) {
    const html = fs.readFileSync('docs/RelPedidoVenda.html').toString()
    
    const options = {
        type: 'pdf',
        height: "297.0mm",        // allowed units: mm, cm, in, px
        width: "400.3mm", 
    }

    pdf.create(html, options).toFile('docs/meupdf.pdf',(err, res) => {
      if(err) return response.status(500).json(err)
        
      console.log("work");
    })
  }

  async update({ request, response }) {
    const rules = this.resource.model.rules;

    if (rules) {
      const validation = await validateAll(
        request.all(),
        rules,
        validationMessages.messages
      );

      if (validation.fails()) {
        return response
          .status(400)
          .json({ message: 'Falha na validação', err: validation.messages() });
      }
    }

    const { id } = request.params;

    const record = await this.resource.model.find(id);

    if (!record) {
      return response.status(404).json({ error: 'Registro não encontrado.' });
    }

    const { accessible_attributes } = await this.getCommonProps();

    const resourceParams = request.only(accessible_attributes);

    record.merge(resourceParams);

    await record.save();

    await record.reload();

    const recordUpdated = await this.resource.model
    .query()
    .with('linhas', (lin) => lin.with('orderprod', (orderprod) => orderprod.with('productObj')).with('productObj'))
    .with('partner')
    .where('id', id)
    .fetch();

    return response.json(recordUpdated);
  }
  

  async filterPdVenda({request, response} ){
    let flag = 0;   
    const b = request.all();
    const {pedido_fox, pedido_cliente, cliente, status, dataInicio, dataFim, tipo_registro, id_PedidoVenda} = b

    let dataMoment = moment(dataInicio);

    let dataIni = moment(dataInicio);
    let dataFi = moment(dataFim);

    let aux = model.query();

    if(pedido_cliente){
       aux 
      .where('pedido_cliente', 'LIKE',`%${pedido_cliente}%`);
      flag = 1
    }

    if(pedido_fox){
      aux.where('pedido_fox', 'LIKE', `%${pedido_fox}%`)
      flag = 1
    }

    if(cliente){
      aux.innerJoin('partner', 'partner_id','partner.id').where('partner.name','like', `%${cliente}%` )
      flag = 1
    }

    if(status){
    aux.where('status','LIKE', `%${status}%`)
    flag = 1
    }

    if(dataInicio){
      aux.where('orddat', '>=', dataIni)
      flag = 1
    }

    if(dataFim){
      aux.where('orddat', '<=', dataFi)
      flag = 1
    }

    if(tipo_registro){
    aux.where('tipo_registro', 'like', `%${tipo_registro}%`)
    flag = 1
    }

    if(id_PedidoVenda){
    aux.where('sales_orders.id', id_PedidoVenda)
    flag = 1
    }
  

    if(flag === 0) {
      let listResponse = await this.resource.model
        .query()
        .select(this.resource.model.visible)
        .with('partner')
        .with('linhas', (lin) => lin
        .with('orderprod')
        .with('productObj')
        
        ).returning('*').fetch();
        
        let array = [];
        array = listResponse.toJSON();

        let retorno =  await statusOfSalesOrder(array);

      return response.status(200).json(retorno);
    }else{

      let listResponse1 = await aux
      .with('partner')
      .with('linhas', (lin) => lin
      .with('orderprod')
      .with('productObj')
      ).fetch();

      let array1 = [];
        array1 = listResponse1.toJSON();

      let retorno1 = await statusOfSalesOrder(array1);
      

      return response.status(200).json(retorno1)
    }
  }
  
}

async function  statusOfSalesOrder (array) {

  try {
    for (const iteratorPdVenda of array) {
      for (const iteratorLinhaPdVenda of iteratorPdVenda.linhas) {
        if(iteratorLinhaPdVenda.product_id === null || iteratorLinhaPdVenda.produto_cliente === null){
          iteratorLinhaPdVenda.isProdutoOk = 0
          iteratorLinhaPdVenda.isKitOk = 0
          iteratorLinhaPdVenda.isEtapaOk = 0
          iteratorLinhaPdVenda.isOrdemOk = 0
          iteratorLinhaPdVenda.isDadosBaseOk = 0

        }else{
          iteratorLinhaPdVenda.isProdutoOk = 1;

          const kitVerif = await Kit.findBy('cod',iteratorLinhaPdVenda.productObj.cod);

          if(kitVerif != null || kitVerif != undefined ){
            iteratorLinhaPdVenda.isKitOk = 1
          }else{
            iteratorLinhaPdVenda.isKitOk = 0
          }
          
          const stepVerif = await stepXprod.findBy('product',iteratorLinhaPdVenda.productObj.id);
          
          if(stepVerif != null || stepVerif != undefined ){
            iteratorLinhaPdVenda.isEtapaOk = 1
          }else{
            iteratorLinhaPdVenda.isEtapaOk = 0
          }

          const orderVerif = await OrderProd.query().where({'product':iteratorLinhaPdVenda.productObj.id,
          'orderFox': iteratorPdVenda.id, 'itemOrderFox': 0 }).fetch();

          let order = orderVerif.toJSON();
          if(order.length != 0 ){
            iteratorLinhaPdVenda.isOrdemOk = 1
          }else{
            iteratorLinhaPdVenda.isOrdemOk = 0
          }

          let string = `${iteratorPdVenda.id}-${iteratorLinhaPdVenda.productObj.cod.trim()}`;
          let pedidoFox = await ListaPedidoFox.findBy( 'cod', string );

          if (pedidoFox != null || pedidoFox != undefined) {
            iteratorLinhaPdVenda.isDadosBaseOk = 1;
          } else {
            iteratorLinhaPdVenda.isDadosBaseOk = 0;
          }
        }

        if(iteratorLinhaPdVenda.partner_id === null ){
          iteratorPdVenda.isClienteOk = 0
        }else{
          iteratorPdVenda.isClienteOk = 1
        }
      }
    } 
    
    return array
  } catch (error) {
    console.log(error);
  }
}

module.exports = SalesOrderController

'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with linsalesorders
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/LinSalesOrder");
const Product = use("App/Models/Product");
const { find } = require('@adonisjs/framework/src/Route/Store');
const { create } = require('html-pdf');
const moment = require('moment');
const sql = require('mssql');
const user = 'ICONNECT';
const pwd = 'Cora@2018';
const url = '201.22.57.246';


class LinSalesOrderController extends ScaffoldController {
  constructor() {
    super();
    this.resource = {model}
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
      .with('orderprod')
      .with('productObj')
      .paginate(page, limit);

    return response.json(listResponse);
  }

  async validateProductLinPdVenda ({request, response}) {
    const req = request.all();
    const { rows }  = req;
    let logs = [];
    let pool = await sql.connect(`mssql://${user}:${pwd}@${url}/FOX_00001`);
    
    try {
      for (const iterator of rows) {
        if(iterator.product_id === null){
            let codProdutoCliente 
            if(iterator.descricao_fornecedor === null){
              codProdutoCliente = ""
            }else{
              codProdutoCliente = iterator.descricao_fornecedor.trim().toUpperCase();
            }
        
            let queryProduto = `SELECT Código, Linha01, Linha02, Linha03, Unidade from Produtos WHERE Código = '${codProdutoCliente}'`
                    
            let resultArvore = await pool.request().query(queryProduto);

            if(resultArvore.recordset.length === 0 ){
              logs.push( "Produto: "+codProdutoCliente + "não encontracado na Base do FOX");
            }else{
              const findPro = await Product.findBy('cod', codProdutoCliente);

              if(findPro === undefined || findPro === null){
                const prdct = new Product();
                prdct.cod = resultArvore.recordset[0].Código;
                prdct.unity = resultArvore.recordset[0].Unidade;
                prdct.description1 = resultArvore.recordset[0].Linha01
                prdct.description2 = resultArvore.recordset[0].Linha02
                prdct.description3 = resultArvore.recordset[0].Linha03

                const createdProduct = await prdct.save();

                if(createdProduct){
                  await prdct.reload();
                  const record = await this.resource.model.find(iterator.id);
                  record.product_id = prdct.id
                  let codProdutoCliente = iterator.descricao_fornecedor.trim().toUpperCase();
                  record.descricao_fornecedor = codProdutoCliente;
                  await record.save();
                  await record.reload();
        
                  logs.push("Produto: " + codProdutoCliente + " CRIADO");
                }else{
                  logs.push( "Produto: "+ codProdutoCliente + " não criado na base de dados Iconnect" );
                }
              }else{
                findPro.unity = resultArvore.recordset[0].Unidade;
                findPro.description1 = resultArvore.recordset[0].Linha01
                findPro.description2 = resultArvore.recordset[0].Linha02
                findPro.description3 = resultArvore.recordset[0].Linha03

                const createdProduct = await Product
                .query()
                .where('cod', findPro.cod)
                .update({unity: findPro.unity , 
                  description1: findPro.description1 , description2: findPro.description2 
                  , description3:findPro.description3 }).returning('*');

                if(createdProduct.length != 0){
                  const record = await this.resource.model.find(iterator.id);
                  record.product_id = createdProduct[0].id
                  let codProdutoCliente = iterator.descricao_fornecedor.trim().toUpperCase();
                  record.descricao_fornecedor = codProdutoCliente;
                  record.is_validate = true
                  await record.save();
                  await record.reload();
        
                  logs.push("Produto: " + codProdutoCliente + " ATUALIZADO");
                }else{
                  logs.push( "Produto: "+ codProdutoCliente + " não criado na base de dados Iconnect" );
                }
              }
            }
        }else{
          const codCliente = iterator.descricao_fornecedor
          let produto;
          produto  = await Product.findBy('cod', iterator.descricao_fornecedor);

          let queryProduto = `SELECT Código, Linha01, Linha02, Linha03, Unidade from Produtos WHERE Código = '${codCliente}'`
          let result = await pool.request().query(queryProduto);

          if(result.recordset.length === 0 ){
            logs.push( "Produto: "+codCliente + "não encontracado na Base do FOX");
          }else{
            if(produto === null || produto === undefined){
              produto = new Product();
              produto.cod = result.recordset[0].Código
            }
            
            if(result.recordset.length === 0){
              logs.push("Produto: "+codCliente + " não Atualizou");
            }else{
              
             // produto.cod = result.recordset[0].Código;
              produto.unity = result.recordset[0].Unidade;
              produto.description1 = result.recordset[0].Linha01
              produto.description2 = result.recordset[0].Linha02
              produto.description3 = result.recordset[0].Linha03
  
              await produto.save();
              await produto.reload();
  
              const record = await this.resource.model.find(iterator.id);
              record.product_id = produto.id
              let codProdutoCliente = iterator.descricao_fornecedor.trim().toUpperCase();
              record.descricao_fornecedor = codProdutoCliente;
              record.is_validate = true;
              await record.save();
              await record.reload();

              
  
              logs.push("Produto: "+codCliente + " ATUALIZADO");
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    return response.status(200).json(logs)

  }

  
  async filterLinPdVenda({request, response} ){
    let flag = 0;
    const b = request.all();
    const {pedido_fox, pedido_cliente, data_entrega, data_prevista, id_PedidoVenda, dataInicio, dataFim , dataInicioM, dataFimM} = b

    // let dataMomentEntrega = moment(data_entrega);
    // let dataMomentPrevista = moment(data_prevista);

    let dataEntregaInicio = moment(dataInicio);
    let dataEntregaFim = moment(dataFim);

    let dataPrevistaInicio = moment(dataInicioM);
    let dataPrevistaFim = moment(dataFimM)


    let aux = model.query();

    if(pedido_cliente){
       aux 
      .where('lin_pedido_cliente', 'LIKE',`%${pedido_cliente}%`);
      flag = 1
    }

    if(pedido_fox){
      aux.where('lin_pedido_fox', 'LIKE', `%${pedido_fox}%`)
      flag = 1
    }

    if(dataInicio){
      aux.where('data_entrega', '>=', dataEntregaInicio)
      flag = 1
    }

    if(dataFim){
      aux.where('data_entrega', '<=', dataEntregaFim)
      flag = 1
    }


    if(dataInicioM){
      aux.where('data_prevista', '>=', dataPrevistaInicio)
      flag = 1
    }

    if(dataFimM){
      aux.where('data_prevista', '<=', dataPrevistaFim)
      flag = 1
    }



    if(id_PedidoVenda){
    aux.where('num_salesorder', id_PedidoVenda)
    flag = 1
    }
  

    if(flag === 0) {
      const listResponse = await this.resource.model
        .query()
        .select('lin_sales_orders.*')
        .with('orderprod')
        .with('productObj')
        .with('salesOrder')
        .innerJoin('sales_orders', 'lin_sales_orders.num_salesorder','sales_orders.id').where('sales_orders.status','like', 'pendente' )
        .fetch()

        return response.status(200).json(listResponse);

    }else{
      return await aux
      .select('lin_sales_orders.*')
      .with('orderprod')
      .with('productObj')
      .with('salesOrder')
      .innerJoin('sales_orders', 'lin_sales_orders.num_salesorder','sales_orders.id').where('sales_orders.status','like', 'pendente' )
      .fetch()
    }
  }
}


module.exports = LinSalesOrderController

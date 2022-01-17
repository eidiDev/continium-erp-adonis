'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with orderprodmaquinas
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/OrderProdMaquina");
const MachineLabor = use("App/Models/MachineLabor");
const OrderProd = use("App/Models/OrderProd");
const Database = use('Database');


class OrderProdMaquinaController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }


  async getMaquinasByPrioridade({ request, response }) {
    const b = request.all();
    let req = {
      body: request.all()
    }

    try {
      const record = req.body;
      console.log('getMaquinasByPrioridade');
      console.log(req.body);
  
      let arrayCerto = [];
      let {
        prioridadeEtapa,
        maquina,
        orderProd,
        dataProd,
        dataEntrega,
        establishments,
        partner,
        product,
        status,
        ordemPrincipal,
      } = record;
  
      if (prioridadeEtapa === '' || prioridadeEtapa === undefined) {
      } else {
        record.prioridadeEtapa = parseInt(record.prioridadeEtapa);
      }
  
      var where = `1=1`;
      if (req.body.establishments !== undefined && req.body.establishments !== '')
        where += ` and op.establishments = ${req.body.establishments} `;
      if (req.body.order.product !== undefined && req.body.order.product !== '')
        where += ` and i.id = ${req.body.order.product} `;
      if (req.body.order.partner !== undefined && req.body.order.partner !== '')
        where += ` and p.id = ${req.body.order.partner} `;
      if (
        req.body.dataProdIni !== undefined &&
        req.body.dataProdIni !== '' &&
        req.body.dataProdIni !== 'Invalid date' &&
        req.body.dataProdIni !== 'Data inválida'
      )
        where += ` and to_date(op."dataProd",'DD-MM-YYYY') >= to_date('${req.body.dataProdIni}','DD-MM-YYYY') `;
      if (
        req.body.dataProdFim !== undefined &&
        req.body.dataProdFim !== '' &&
        req.body.dataProdFim !== 'Invalid date' &&
        req.body.dataProdFim !== 'Data inválida'
      )
        where += ` and to_date(op."dataProd",'DD-MM-YYYY') <= to_date('${req.body.dataProdIni}','DD-MM-YYYY') `;
      if (
        req.body.dataEntregaIni !== undefined &&
        req.body.dataEntregaIni !== '' &&
        req.body.dataEntregaIni !== 'Invalid date' &&
        req.body.dataEntregaIni !== 'Data inválida' 
      )
        where += ` and to_date(op."dataEntrega",'DD-MM-YYYY') >= to_date('${req.body.dataProdIni}','DD-MM-YYYY') `;
      if (
        req.body.dataEntregaFim !== undefined &&
        req.body.dataEntregaFim !== '' &&
        req.body.dataEntregaFim !== 'Invalid date' &&
        req.body.dataEntregaFim !== 'Data inválida'
      )
        where += ` and to_date(op."dataEntrega",'DD-MM-YYYY') >= to_date('${req.body.dataProdIni}','DD-MM-YYYY') `;
      if (
        req.body.order.prioridadeEtapaIni !== undefined &&
        req.body.order.prioridadeEtapaIni !== ''
      )
        where += ` and opm."prioridadeEtapa" >= ${req.body.order.prioridadeEtapaIni} `;
      if (
        req.body.order.prioridadeEtapaFim !== undefined &&
        req.body.order.prioridadeEtapaFim !== ''
      )
        where += ` and opm."prioridadeEtapa" <= ${req.body.order.prioridadeEtapaFim} `;
      if (req.body.status !== undefined && req.body.status.length > 0)
        where +=
          ` and opm."statusEtapa" in (` +
          req.body.status.map((item) => "'" + item + "'").toString() +
          `) `;
      if (
        req.body.order.pedidoCliente !== undefined &&
        req.body.order.pedidoCliente !== ''
      )
        where += ` and op."pedidoCliente" = '${req.body.order.pedidoCliente}'`;
      if (req.body.order.orderFox !== undefined && req.body.order.orderFox !== '')
        where += ` and op."orderFox" = '${req.body.order.orderFox}'`;
      if (req.body.orderProd !== undefined && req.body.orderProd !== '')
        where += ` and op."orderProduction" = '${req.body.orderProd}'`;
      if (req.body.ordemPrincipal !== undefined && req.body.ordemPrincipal !== '')
        where += ` and (lower(op."ordemPrincipal") = lower('${req.body.ordemPrincipal}') or lower(op."orderProduction") = lower('${req.body.ordemPrincipal}'))`;
      if (req.body.maquina !== undefined && req.body.maquina !== '')
        where += ` and lower(opm.maquina) = lower('${req.body.maquina}') `;
      if (req.body.montagem !== undefined && req.body.montagem !== '')
        where += ` and lower(opm.montagem) = lower('${req.body.montagem}') `;
  
      // if(req.body.orderProd !== undefined && req.body.orderProd !== '')
      //   partner
  
      var SQL = `
        select opm.id,
        opm."orderProd",
        op."orderProduction",
        op."ordemPrincipal",
        opm.maquina,
        opm.montagem,
        op.status,
        i.cod AS product,
        op.prioridade,
        opm."statusEtapa",
        opm."prioridadeEtapa",
        opm.sequencia,
        op.qtde,
        op."pedidoCliente",
        op."orderFox",
        op."dataEntrega",
        op."dataProd",
        p.razao_social,
        e.name,
        t."tempoPrevisto",
        t."tempoRealizado",
        t."custoPrevisto",
        t."custoRealizado",
        t.saldo
        from "orderprodmaquina" as opm
        inner join orderProd as op on op.id = opm."orderProd"
        inner join partner as p on p.id = op.partner
        inner join establishment e on e.id = op.establishments
        inner join timeandcusto t on t."orderProd" = opm."orderProd"
        inner join product i on i.id = op.product
        where ${where}
        order by opm."orderProd" desc`;

  
      // Send it to the database.

      const testeRetorno = await Database.raw(SQL)
      // sails.log(rawResult);
  
       return response.status(200).json(testeRetorno.rows);


    } catch (error) {
      console.log(error);
    }
    // Send it to the database.
    // var rawResult = await sails.sendNativeQuery(SQL);

    // // sails.log(rawResult);

    // return res.status(200).json(rawResult.rows);
  }


  async getOnlyMaquinas({ request, response }) {
    console.log('get Only Maquinas..');
    const stringMaquina = 'maquina';
    const stringMontagem = 'montagem';

    const listaRetorno1 = await MachineLabor.query().whereIn('type', [stringMaquina, stringMontagem]).fetch();

    return response.status(200).json(listaRetorno1);
  }

  async getOrderProdMaquinaByMaquina({ request, response }) {
    var ids = request.params.idMaquina.split(',');
    console.log('GetOrderProdMaquinaByMaquina', ids);

    try {

      var results = await this.resource.model.query()
        .whereIn('maquina', ids)
        .orWhereIn('montagem', ids)
        .whereNotIn('statusEtapa', ['finalizada', 'planejada'])
        .with('orderProdObj', (op) => { op.with('maquinas') }).fetch()

      results = results.rows
      results.forEach((item) => {
        item = item.toJSON();
        if (item.orderProdObj !== null) {
          // if (item.orderProd.id === 616) {
          const etapaId = item.id; //Pega o id da etapa
          const etapas = item.orderProdObj.maquinas.sort((a, b) =>
            a.id > b.id ? 1 : b.id > a.id ? -1 : 0
          ); // As etapas da ordem de produçao
          item['liberada'] = true;
          item['etapa_anterior'] = '';
          //Se só tiver 1 etapa, ou a etapa é a primera, entao vai estar sempre liberada

          // console.log('maquinas:', etapas);
          if (etapas.length === 1 || etapas[0].id === etapaId) {
            item['liberada'] = true;
            item['etapa_anterior'] = '';
          } else {
            const indexEtapa = etapas.findIndex(
              (etapa) => etapa.id === etapaId
            );
            if (indexEtapa - 1 >= 0) {
              if (etapas[indexEtapa - 1].statusEtapa !== 'finalizada') {
                item['liberada'] = false;
                item['etapa_anterior'] = etapas[indexEtapa - 1].codEtapas;
              }
            }
          }
          // }
        }
      });

      response.status(200).json(results);
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  }


}

module.exports = OrderProdMaquinaController

'use strict'

const LinhaPedidoVenda = use("App/Models/LinSalesOrder");
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/FollowUp");
const moment = require('moment');
const axios = require('axios');
const xmlWith = require('../../../assets/knapp.js');
const url = `https://knbrerp.knapp.com:8181/g5-senior-services/sapiens_Synccom_senior_g5_co_mcm_cpr_ordemcompra?wsdl`




class FollowUpController extends ScaffoldController {
    constructor() {
        super();
        this.resource = { model }
    }


    async followUpObs({ request, response }) {
        const req = request.all();
        const { rows } = req;

        let logs = [];

        try {
            for (const linSalesOrder of rows) {
                let findData = await LinhaPedidoVenda.findBy('id', linSalesOrder.id);
                let dataAntiga = moment(findData.data_prevista).format('DD-MM-YYYY');

                //mudar a data prevista e obs da linha
                let data = linSalesOrder.data_prevista;
                let obse = linSalesOrder.obs;
                let orderprodHas = linSalesOrder.orderprod_id;
                let idLinha = linSalesOrder.id

                const updateLin = await LinhaPedidoVenda
                    .query()
                    .where('id', idLinha)
                    .update({ obs: obse, data_prevista: data }).returning('*');

                console.log(updateLin);
                if (updateLin.length != 0) {
                    logs.push('Data prevista e observação da Linha: ' + updateLin[0].id + ' ATUALIZADAS !');
                   const msgretornoKnapp = await AtualizarPedidoNoFox(updateLin)
                   logs.push(msgretornoKnapp);
                }

                //Ver se o registro na tabela FollowUp existe
                // Analisar se a linha tem ordem ou nao
                let seeFollowUp
                if (orderprodHas === null) {
                    seeFollowUp = await this.resource.model
                        .query()
                        .where({ num_lin_salesorder: idLinha }).fetch();
                } else {
                    seeFollowUp = await this.resource.model
                        .query()
                        .where({ num_lin_salesorder: idLinha, num_orderprod: orderprodHas }).fetch();
                }

                //Se o registro existe pegar a lista de mensagens e atualizar ela, se não criar registro
                if (seeFollowUp.rows.length != 0) {
                    const listaObs = seeFollowUp.rows[0].observations;

                    listaObs.push(`A data prevista (${dataAntiga}) da linha: `
                        + linSalesOrder.id
                        + ' do Pedido Venda: '
                        + linSalesOrder.num_salesorder
                        + ` está sendo mudada para (${moment(data).format('DD-MM-YYYY')}) por este motivo: ` + obse);

                    let myJsonString2 = JSON.stringify(listaObs);

                    const updateFollowUp = await this.resource.model
                        .query()
                        .where('id', seeFollowUp.rows[0].id)
                        .update({ observations: myJsonString2 }).returning('*');
                    if (updateFollowUp.length != 0) {
                        logs.push('Lista de observações da Linha: ' + seeFollowUp.rows[0].num_lin_salesorder + ' ATUALIZADAS !');
                    }
                    console.log(updateFollowUp);
                } else {
                    let listaObsMessages = [];
                    listaObsMessages.push(`A data prevista (${dataAntiga}) da linha: `
                        + linSalesOrder.id
                        + ' do Pedido Venda: '
                        + linSalesOrder.num_salesorder
                        + ` está sendo mudada para (${moment(data).format('DD-MM-YYYY')}) por este motivo: ` + obse)

                    let myJsonString = JSON.stringify(listaObsMessages);
                    const objFollowUpToCreated = {
                        num_lin_salesorder: idLinha,
                        num_orderprod: orderprodHas,
                        observations: myJsonString
                    }

                    const recordFollowUpCreated = await this.resource.model.create(objFollowUpToCreated);

                    if (recordFollowUpCreated != null || recordFollowUpCreated != undefined) {
                        logs.push('Lista de observações da Linha: ' + recordFollowUpCreated.num_lin_salesorder + ' foi CRIADA !');
                    }
                    console.log(recordFollowUpCreated);
                }
            }

            return response.status(200).json(logs);
        } catch (error) {
            console.log(error);
        }
    }


    async filterLinPdVendaFollowUp({ request, response }) {
        try {

            let flag = 0;
            const b = request.all();
            const { pedido_fox, pedido_cliente, data_entrega, data_prevista, id_PedidoVenda , dataInicio, dataFim , dataInicioM, dataFimM} = b

            let dataMomentEntrega = moment(data_entrega);
            let dataMomentPrevista = moment(data_prevista);

            let dataEntregaInicio = moment(dataInicio);
            let dataEntregaFim = moment(dataFim);

            let dataPrevistaInicio = moment(dataInicioM);
            let dataPrevistaFim = moment(dataFimM)


            let aux = LinhaPedidoVenda.query();

            if (pedido_cliente) {
                aux
                    .where('lin_pedido_cliente', 'LIKE', `%${pedido_cliente}%`);
                flag = 1
            }

            if (pedido_fox) {
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


            if (id_PedidoVenda) {
                aux.where('num_salesorder', id_PedidoVenda)
                flag = 1
            }


            if (flag === 0) {
                const listResponse = await LinhaPedidoVenda
                    .query()
                    //.select('lin_sales_orders.*')
                    .with('orderprod')
                    .with('productObj')
                    .with('salesOrder')
                    // .innerJoin('sales_orders', 'lin_sales_orders.num_salesorder','sales_orders.id').where('sales_orders.status','like', 'pendente' )
                    .fetch()

                return response.status(200).json(listResponse);

            } else {
                return await aux
                    .select('lin_sales_orders.*')
                    .with('orderprod')
                    .with('productObj')
                    .with('salesOrder')
                    //.innerJoin('sales_orders', 'lin_sales_orders.num_salesorder','sales_orders.id').where('sales_orders.status','like', 'pendente' )
                    .fetch()
            }

        } catch (error) {
            console.log(error);
        }
    }


    async getSpeFollowOnOrder({ request, response }) {
        const req = request.all();

        const findFollowUp = await this.resource.model
            .findBy('num_orderprod', req.id);

        if (findFollowUp != null) {
            return response.status(200).json(findFollowUp.observations)
        } else {
            return ['Lista de observações de Follow Up não criada']
        }
    }
}

async function AtualizarPedidoNoFox(linha) {
    let dateInLine = moment(linha[0].data_prevista).format('DD/MM/YYYY');
    console.log(dateInLine);
    let idPd = linha[0].num_salesorder
    let seq = linha[0].sequencia
    let teste = xmlWith({ dataPrevista: dateInLine, idPd: idPd,seq: seq });
    console.log(teste);

    var config = {
        headers: {
            'Content-Type': 'text/xml',
            //SOAPAction:'http://services.senior.com.br/sapiens_Synccom_senior_g5_co_mcm_cpr_ordemcompra/GravarOrdensCompra_4'
        }
    };

    let msg;

    try {
        const res = await axios.post(url, teste, config);
        
        if(res.status === 200){
          console.log(res);
          return  msg = 'Data atualizada no sistema da KNAPP'
        }   
    } catch (error) {
       return msg = 'Ocorreu algum erro referente a comunicação com sistema da KNAPP'
    }
}

module.exports = FollowUpController

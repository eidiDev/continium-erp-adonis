'use strict'
const model = use("App/Models/NoteProd");
const OrderProd = use("App/Models/OrderProd");
const OrderProdMaquina = use("App/Models/OrderProdMaquina");
const MachineLabor = use("App/Models/MachineLabor");
const Timeandcusto = use("App/Models/Timeandcusto");
const ScaffoldController = use('ScaffoldController');
var TimeFormat = require('hh-mm-ss');
const moment = require('moment');




class NoteProdController extends ScaffoldController {
    constructor() {
        super();
        this.resource = { model }
    }


    async store({ request, response }) {
        let req = {
            body: request.all()
        }

        let id = 0;
        req.body.apontamento = '1';

        const orderId = req.body.orderProd;
        const maqId = req.body.orderProdMaqId;

        req.body.dataInicio = moment().format("DD/MM/YY HH:mm:ss");
        delete req.body.orderProdMaqId;

        try {
            const createdRow = await this.resource.model.create(req.body);

            if (createdRow) {
                let data = moment().format('MM/YY');

                createdRow.apontamento = `APTPRO-${data}-${('000000' + createdRow.id).slice(
                    -6
                )}`;

                createdRow.save();
                createdRow.reload();

                id = createdRow.id;

                let note = await this.resource.model.query().where('id', id)
                    .with('etapaObj')
                    .with('colaboradorObj').fetch();

                let notes = await this.resource.model.query().where('orderProd', orderId).fetch();

                // let note = await NoteProd.findOne(id)
                //     .populate('etapa')
                //     .populate('colaborador');
                // let notes = await NoteProd.find({ orderProd: orderId });

                console.log('notes: ', notes.length);

                if (
                    req.body.tipo === 'programar' ||
                    req.body.tipo === 'montar' ||
                    req.body.tipo === 'operar'
                ) {
                    await OrderProd.query().where({ id: orderId }).update({ status: 'execução' });
                    await OrderProdMaquina.query().where({ id: maqId }).update({
                        statusEtapa: 'execucao',
                    });
                    // await OrderProd.updateOne({ id: orderId }).set({ status: 'execução' });
                    // await OrderProdMaquina.updateOne({ id: maqId }).set({
                    //     statusEtapa: 'execucao',
                    // });

                    if (notes.rows.length === 1) {
                        await OrderProd.query().where({ id: orderId }).update({
                            dataProd: moment().format('DD-MM-YYYY'),
                        });
                        // await OrderProd.updateOne({ id: orderId }).set({
                        //     dataProd: moment().format('DD-MM-YYYY'),
                        // });
                    }
                }

                if (req.body.tipo === 'pausar') {
                    await OrderProd.query().where({ id: orderId }).update({ status: 'pausada' });
                    await OrderProdMaquina.query().where({ id: maqId }).update({
                        statusEtapa: 'pausada',
                    });
                    // await OrderProd.updateOne({ id: orderId }).set({ status: 'pausada' });
                    // await OrderProdMaquina.updateOne({ id: maqId }).set({
                    //     statusEtapa: 'pausada',
                    // });
                }

                response.status(200).json(note);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async createOnWeb({ request, response }) {
        let req = {
            body: request.all()
        }

        let id = 0;
        req.body.apontamento = '1';

        const orderId = req.body.orderProd;
        const maqId = req.body.orderProdMaqId;
        const objOrdem = await OrderProd.findBy('id', orderId);
        // Procurar id da maquina em machineLabor dentro do registro de OrderProdMaquina
        let ordermaq = await OrderProdMaquina.findBy('id', maqId);
        let machine;
        if (ordermaq.maquina === "") {
            machine = await MachineLabor.findBy('cod', ordermaq.montagem);
            req.body.etapa = machine.id
        } else {
            machine = await MachineLabor.findBy('cod', ordermaq.maquina);
            req.body.etapa = machine.id
        }
        // fim de procura.

        //Criando apontamento
        delete req.body.orderProdMaqId;


        try {
            const createdRow = await this.resource.model.create(req.body);

            if (createdRow) {
                let data = moment().format('MM/YY');

                createdRow.apontamento = `APTPRO-${data}-${('000000' + createdRow.id).slice(
                    -6
                )}`;

                createdRow.save();
                createdRow.reload();

                id = createdRow.id;

                let note = await this.resource.model.query().where('id', id)
                    .with('etapaObj')
                    .with('colaboradorObj').fetch();

                let notes = await this.resource.model.query().where('orderProd', orderId).fetch();

                // let note = await NoteProd.findOne(id)
                //     .populate('etapa')
                //     .populate('colaborador');
                // let notes = await NoteProd.find({ orderProd: orderId });

                console.log('notes: ', notes.length);

                if (
                    req.body.tipo === 'programar' ||
                    req.body.tipo === 'montar' ||
                    req.body.tipo === 'operar'
                ) {
                    await OrderProd.query().where({ id: orderId }).update({ status: 'execução' });
                    await OrderProdMaquina.query().where({ id: maqId }).update({
                        statusEtapa: 'execucao',
                    });
                    // await OrderProd.updateOne({ id: orderId }).set({ status: 'execução' });
                    // await OrderProdMaquina.updateOne({ id: maqId }).set({
                    //     statusEtapa: 'execucao',
                    // });

                    if (notes.rows.length === 1) {
                        await OrderProd.query().where({ id: orderId }).update({
                            dataProd: moment().format('DD-MM-YYYY'),
                        });
                    }
                }

                if (req.body.tipo === 'pausar') {
                    await OrderProd.query().where({ id: orderId }).update({ status: 'pausada' });
                    await OrderProdMaquina.query().where({ id: maqId }).update({
                        statusEtapa: 'pausada',
                    });
                    // await OrderProd.updateOne({ id: orderId }).set({ status: 'pausada' });
                    // await OrderProdMaquina.updateOne({ id: maqId }).set({
                    //     statusEtapa: 'pausada',
                    // });
                }

                if (maqId && maqId !== '') {

                    let timeCust = await Timeandcusto.findBy('orderProd', orderId);

                    if (!timeCust) {
                        let objTocreate = {
                            orderProd: orderId,
                            tempoPrevisto: 0,
                            tempoRealizado: 0,
                            custoPrevisto: 0,
                            custoRealizado: 0,
                            saldo: 0,
                        };
                        timeCust = await Timeandcusto.create(objTocreate);
                    }

                    let tempo = timeCust.tempoRealizado;
                    let tempo2 = req.body.tempoRealizado;

                    //soma dos tempo antigo na tabela com o novo tempo de apontamento
                    let add = addTimes(tempo, tempo2);


                    await Timeandcusto.query().where({ id: timeCust.id }).update({
                        tempoRealizado: add,
                    });
                    // await Timeandcusto.updateOne({ id: timeCust.id }).set({
                    //     tempoRealizado: add,
                    // });

                    // colocando custo.

                    let machineLab = await MachineLabor.query().where('id', req.body.etapa)
                        .with('rateTimeRelations').fetch();

                    // let machineLab = await MachineLabor.findOne({
                    //     id: req.body.etapa,
                    // }).populate('rateTimeRelation');
                    if (machineLab.rows[0] !== undefined) {
                        const machineJson = machineLab.rows[0].toJSON(); 
                        
                        if (machineJson.rateTimeRelations !== null) {
                            let custoHora = machineJson.rateTimeRelations.valor / 60;
    
                            let toseconds = TimeFormat.toS(add);
                            console.log(toseconds);
                            let toMinutes = toseconds / 60;
    
                            let aux, aux2, resultado;
    
                            aux = toMinutes * objOrdem.qtde;
                            aux2 = aux * custoHora.toFixed(3);
                            resultado = aux2;
    
                            await Timeandcusto.query().where({ id: timeCust.id }).update({
                                custoRealizado: resultado,
                            });
                            // await Timeandcusto.updateOne({ id: timeCust.id }).set({
                            //     custoRealizado: resultado,
                            // });
                        }
                    }
                    

                }

                response.status(200).json(note.rows[0]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getOnlyOrderProdmaqByOrder({ request, response }) {
        let req = {
            body: request.all()
        }

        let listaCerta = [];
        let id = req.body.idOrder;
        let ordem = await OrderProd.query().where('id', id).with('maquinas').first();
        let objReturn = ordem.toJSON();

        return response.status(200).json(objReturn.maquinas);
    }


    async update({ request, response }) {
        let req = {
            body: request.all()
        }

        console.log('update...');
        const idApt = request.params.id;
        const orderId = req.body.orderProd;
        const maqId = req.body.orderProdMaqId;
        
        delete req.body.orderProdMaqId;

        const { dataFim, tempoRealizado, qtdeApontada } = req.body;

        console.log('dataFim', dataFim);
        console.log('qtdeApontada', qtdeApontada);

        if (req.body.dataFim && req.body.dataFim !== '') {
            req.body.dataFim = moment().format("DD/MM/YY HH:mm:ss");
        }

        // pegando Id da maquina em MachineLabor

        const OrderMaquina = await OrderProdMaquina.query().where({id: maqId }).first();
        let getMachineLabor
        if(OrderMaquina.maquina){
            getMachineLabor = await MachineLabor.query().where({cod: OrderMaquina.maquina }).first();

        }else{
            getMachineLabor = await MachineLabor.query().where({cod: OrderMaquina.montagem }).first();
        }

        console.log(getMachineLabor);

        try {

            const updateReturn = await this.resource.model.query()
                .where({ id: idApt }).update(req.body).returning('*');

            //const updateReturn = await NoteProd.updateOne({ id: idApt }).set(req.body);
            try {
                if (dataFim && tempoRealizado) {
                    console.log(' entrou ');
                    if (req.body.dataFim !== '' || req.body.tempoRealizado !== '') {
                        if (maqId && maqId !== '') {
                            //await OrderProd.updateOne({id: orderId}).set({status: "liberada"});

                            await OrderProdMaquina.query().where({ id: maqId })
                            .update({
                                statusEtapa: 'liberada',
                            });

                            // await OrderProdMaquina.updateOne({ id: maqId }).set({
                            //     statusEtapa: 'liberada',
                            // });
                            console.log('2');

                            const objOrdem = await OrderProd.findBy( 'id', orderId );
                            // const objMaq = await OrderProdMaquina.findOne({ id: maqId });

                            // for (const iterator of objOrdem.etapas) {
                            //   if (
                            //     iterator.etapas === objMaq.codEtapas &&
                            //     iterator.sequencia === objMaq.sequencia
                            //   ) {
                            //     iterator.statusEtapa = 'liberada';
                            //   }
                            // }

                            // await OrderProd.updateOne({ id: orderId }).set({
                            //   etapas: objOrdem.etapas,
                            // });

                            let timeCust = await Timeandcusto.findBy( 'orderProd', orderId );

                            if (timeCust === undefined) {
                                let objTocreate = {
                                    orderProd: orderId,
                                    tempoPrevisto: 0,
                                    tempoRealizado: 0,
                                    custoPrevisto: 0,
                                    custoRealizado: 0,
                                    saldo: 0,
                                };
                                timeCust = await Timeandcusto.create(objTocreate);
                            }

                            console.log('3');

                            if (
                                timeCust !== undefined &&
                                (timeCust.tempoRealizado === '' || timeCust.tempoRealizado === '0')
                            ) {
                                console.log('4');
                                await Timeandcusto.query().where({ id: timeCust.id }).update({
                                    tempoRealizado: req.body.tempoRealizado,
                                });
                                // await Timeandcusto.updateOne({ id: timeCust.id }).set({
                                //     tempoRealizado: req.body.tempoRealizado,
                                // });

                                let machineLab = await MachineLabor.query().where('id',getMachineLabor.id)
                                .with('rateTimeRelations').fetch();

                                if (machineLab.rows[0] !== undefined) {
                                    const machineJson = machineLab.rows[0].toJSON(); 
                                    if (machineJson.rateTimeRelations !== null && machineJson.rateTimeRelations !== undefined) {
                                        let custoHora = machineJson.rateTimeRelations.valor / 60;

                                        let toseconds = TimeFormat.toS(req.body.tempoRealizado);
                                        console.log(toseconds);
                                        let toMinutes = toseconds / 60;
                                        console.log('7');

                                        let aux, aux2, resultado;

                                        aux = toMinutes * objOrdem.qtde;
                                        aux2 = aux * custoHora.toFixed(3);
                                        resultado = aux2;

                                        await Timeandcusto.query().where({ id: timeCust.id })
                                        .update({
                                            custoRealizado: resultado,
                                        });
                                        // await Timeandcusto.updateOne({ id: timeCust.id }).set({
                                        //     custoRealizado: resultado,
                                        // });
                                    }
                                }
                            } else {
                                console.log('5');
                                let tempo = timeCust.tempoRealizado;
                                let tempo2 = req.body.tempoRealizado;

                                //soma dos tempo antigo na tabela com o novo tempo de apontamento
                                let add = addTimes(tempo, tempo2);

                                await Timeandcusto.query().where({ id: timeCust.id }).update({
                                    tempoRealizado: add,
                                });
                                // await Timeandcusto.updateOne({ id: timeCust.id }).set({
                                //     tempoRealizado: add,
                                // });

                                // colocando custo.
                                console.log('6');

                                let machineLab = await MachineLabor.query().where('id',getMachineLabor.id)
                                .with('rateTimeRelations').fetch();

                                if (machineLab.rows[0] !== undefined) {
                                    const machineJson = machineLab.rows[0].toJSON(); 
                                    if (machineJson.rateTimeRelations !== null && machineJson.rateTimeRelations !== undefined) {
                                        let custoHora = machineJson.rateTimeRelations.valor / 60;

                                        let toseconds = TimeFormat.toS(add);
                                        console.log(toseconds);
                                        let toMinutes = toseconds / 60;
                                        console.log('7');

                                        let aux, aux2, resultado;

                                        aux = toMinutes * objOrdem.qtde;
                                        aux2 = aux * custoHora.toFixed(3);
                                        resultado = aux2;

                                        await Timeandcusto.query().where({ id: timeCust.id })
                                        .update({
                                            custoRealizado: resultado,
                                        });
                                        // await Timeandcusto.updateOne({ id: timeCust.id }).set({
                                        //     custoRealizado: resultado,
                                        // });
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }

            return response.status(200).json(updateReturn[0]);

        } catch (error) {
            console.log(error);
        }
    }

    async destroy({ params: { id }, response }) {
        try {
          const current = await this.resource.model.findOrFail(id);
          if(current){
            // pegar o id da orderprd vinculado a esse apontamento
            const getOrderprodID = current.orderProd;
            const objOrdem = await OrderProd.findBy( 'id', current.orderProd );
            console.log(getOrderprodID);

            // pegar a tabela timeandcusto
            const getTimecusto = await Timeandcusto.query().where({orderProd:getOrderprodID }).first();
            console.log(getTimecusto);

            
            // Momento que o apontamento é apagado
            await this.resource.model.query().where({id}).delete();
            
            //Atualizar tempo quando o apontamento for apagado

            const getApontamentos = await this.resource.model.query().where({orderProd: getOrderprodID }).fetch();
            const listApontamentos = getApontamentos.rows;

            let inicioTempo = '00:00:00';
            let somasTempo;
            let index = 0;
            
            if(listApontamentos.length === 0){
                somasTempo = inicioTempo
            }else{
                for (const iterator of listApontamentos) {
                    if(index === 0){
                      somasTempo = addTimes(inicioTempo , iterator.tempoRealizado)
                    }else{
                      somasTempo = addTimes(somasTempo , iterator.tempoRealizado)
                    }
                    index = index + 1
                }
            }
            

            await Timeandcusto.query().where({ id: getTimecusto.id })
            .update({
                tempoRealizado: somasTempo,
            });
            
            //Atualizar custo quando o apontamento for apagado

            const OrderMaquina = await OrderProdMaquina.query().where({id: current.etapa }).first();
            let getMachineLabor
            if(OrderMaquina.maquina){
                getMachineLabor = await MachineLabor.query().where({cod: OrderMaquina.maquina }).first();

            }else{
                getMachineLabor = await MachineLabor.query().where({cod: OrderMaquina.montagem }).first();
            }

            let machineLab = await MachineLabor.query().where('id',getMachineLabor.id)
            .with('rateTimeRelations').fetch();

            if (machineLab.rows[0] !== undefined) {
                const machineJson = machineLab.rows[0].toJSON(); 
                if (machineJson.rateTimeRelations !== null && machineJson.rateTimeRelations !== undefined) {
                    let custoHora = machineJson.rateTimeRelations.valor / 60;

                    let toseconds = TimeFormat.toS(somasTempo);
                    console.log(toseconds);
                    let toMinutes = toseconds / 60;
                    console.log('7');

                    let aux, aux2, resultado;

                    aux = toMinutes * objOrdem.qtde;
                    aux2 = aux * custoHora.toFixed(3);
                    resultado = aux2;

                    let resultCustoAtual
                    if(somasTempo === '00:00:00'){
                        resultCustoAtual = 0
                    }else{
                        resultCustoAtual = getTimecusto.custoRealizado
                    }
                    let resultCustoAposDelete = (resultCustoAtual - resultado)

                    if(parseFloat(resultCustoAposDelete) <= 0){
                        resultCustoAposDelete = 0
                    }

                    await Timeandcusto.query().where({ id: getTimecusto.id })
                    .update({
                        custoRealizado: resultCustoAposDelete,
                    });
                }
            }
          }else{
            return response.status(400).json({message: 'Apontamento não encontrado na base de dados, tente novamente'})
          }
          
          return response.status(200).json({message: `Apontamento ${id} foi deletado ` });
        } catch (error) {
          console.log(error);
        }
    }
}



function addTimes(startTime, endTime) {
    var times = [0, 0, 0];
    var max = times.length;

    var a = (startTime || '').split(':');
    var b = (endTime || '').split(':');

    // normalize time values
    for (var i = 0; i < max; i++) {
        a[i] = isNaN(parseInt(a[i])) ? 0 : parseInt(a[i]);
        b[i] = isNaN(parseInt(b[i])) ? 0 : parseInt(b[i]);
    }

    // store time values
    for (var i = 0; i < max; i++) {
        times[i] = a[i] + b[i];
    }

    var hours = times[0];
    var minutes = times[1];
    var seconds = times[2];

    if (seconds >= 60) {
        var m = (seconds / 60) << 0;
        minutes += m;
        seconds -= 60 * m;
    }

    if (minutes >= 60) {
        var h = (minutes / 60) << 0;
        hours += h;
        minutes -= 60 * h;
    }

    return (
        ('0' + hours).slice(-2) +
        ':' +
        ('0' + minutes).slice(-2) +
        ':' +
        ('0' + seconds).slice(-2)
    );
}


module.exports = NoteProdController

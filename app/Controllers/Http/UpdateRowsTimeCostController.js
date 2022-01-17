'use strict'

const Database = use('Database');
const OrderProd = use("App/Models/OrderProd");
const MachineLabor = use("App/Models/MachineLabor");
const Timeandcusto = use("App/Models/Timeandcusto");

class UpdateRowsTimeCostController {

    async UpdateRowsTimeCost () {
        
        const ordens = await OrderProd.query().with('apontamentos').with('tempoEcustos').fetch();


        for (let iterator of ordens.rows) {
            iterator = iterator.toJSON();
            console.log(iterator);
            
            //atualizar tempo custo ou criar tempo custo caso ordem nao tiver

            if(iterator.tempoEcustos.length === 0){
                await calculoTempoEcusto(iterator)
            }
        }


    }
}

async function calculoTempoEcusto(order) {
    let objTocreate = {
      orderProd: '',
      tempoPrevisto: '',
      tempoRealizado: 0,
      custoPrevisto: '',
      custoRealizado: 0,
      saldo: 0,
    };
    // colocando o id da ordem
    objTocreate.orderProd = order.id;
  
    let listadeEtapas = order.etapas;
  
    let listaDeMaquinas = [];
    let listaDeMontagens = [];
    let resultado = 0;
  
    //Loop para pegar todas as maquinas e montagens em steps
    for (const steps of listadeEtapas) {
      let objMaq = {};
      objMaq = {
        maquina: '',
        tempoMaquina: '',
      };
      if (steps.maquina !== '') {
        objMaq.maquina = steps.maquina;
        objMaq.tempoMaquina = steps.tempoMaquina;
        listaDeMaquinas.push(objMaq);
      }
  
      let objMontg = {};
      objMontg = {
        montagem: '',
        tempoMontagem: '',
      };
  
      if (steps.montagem !== '') {
        objMontg.montagem = steps.montagem;
        objMontg.tempoMontagem = steps.tempoMontagem;
  
        listaDeMontagens.push(objMontg);
      }
    }
  
    let aux, aux2, maquinaObj, custoHora;
    //Fazer tratamento do calculo em cada maquina que estiver em steps
    for (const iterator of listaDeMaquinas) {
      //Pegando a taxahora da maquina
      maquinaObj = await MachineLabor.query().where('cod', iterator.maquina).with('rateTimeRelations').fetch();
  
      maquinaObj = maquinaObj.toJSON();
      // dividindo por 60
      custoHora = maquinaObj[0].rateTimeRelations.valor / 60;
      //tempoMaquina X quantidade de peças
      aux = iterator.tempoMaquina * parseInt(order.qtde);
      aux2 = aux * custoHora;
      resultado += aux2;
  
      maquinaObj = {};
      custoHora = 0;
      aux = 0;
      aux2 = 0;
    }
  
    //Fazer tratamento agora com as montagens
    for (const iterator of listaDeMontagens) {
      maquinaObj = await MachineLabor.query().where('cod', iterator.montagem).with('rateTimeRelations').fetch();
  
      maquinaObj = maquinaObj.toJSON();
      if (maquinaObj.length != 0) {
        custoHora = maquinaObj[0].rateTimeRelations.valor / 60;
  
        aux = iterator.tempoMontagem * parseInt(order.qtde);
        aux2 = aux * custoHora;
        resultado += aux2;
  
        maquinaObj = {};
        custoHora = 0;
        aux = 0;
        aux2 = 0;
      }
    }
  
    // colocando o custo previsto
    objTocreate.custoPrevisto = resultado;
  
    let resultado2 = 0;
    let aux3;
    // looping nas maquinas para pegar o tempo de cada uma
    for (const iterator of listaDeMaquinas) {
      aux3 = iterator.tempoMaquina * parseInt(order.qtde);
      resultado2 += aux3;
  
      aux3 = 0;
    }
  
    //looping nas motnagens pra pegar o tempo de cada uma
    for (const iterator of listaDeMontagens) {
      aux3 = iterator.tempoMontagem * parseInt(order.qtde);
      resultado2 += aux3;
  
      aux3 = 0;
    }
  
    //colocando o tempo previsto
    objTocreate.tempoPrevisto = resultado2;
  
    await Timeandcusto.create(objTocreate);
}

module.exports = UpdateRowsTimeCostController

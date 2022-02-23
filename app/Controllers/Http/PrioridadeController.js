'use strict'

const Database = use('Database');
const OrderProdMaquina = use("App/Models/OrderProdMaquina");
const moment = require('moment');

class PrioridadeController {


  async index({ request, response }) {
  
    const { idMaquina, dataProdIni, dataProdFim, dataEntregaFim, dataEntregaIni } = request.all();

    const lista = await getPrioridades(idMaquina, dataProdIni, dataProdFim, dataEntregaFim, dataEntregaIni);

    return response.status(200).json(lista);
  }

  async update({ request, response }) {
    let req = {
      body: request.all()
    }

    try {
      const { listUpdate, idMaquina } = req.body;
      console.log('idMaquina', idMaquina);
      let prioridadeByMaquina = [];

      for await (const itemUpdate of listUpdate) {
        // listUpdate.forEach(async (itemUpdate) => {
        // const itemPrioridade = prioridadeByMaquina.find(
        //   (maquina) => maquina.id === itemUpdate.maquina
        // );
        let itemPrioridade = {};
        let prioridadeEtapa = 1;
        for (var i in prioridadeByMaquina) {
          if (
            prioridadeByMaquina[i].id ===
            `${itemUpdate.statusEtapa}-${itemUpdate.maquina}`
          ) {
            itemPrioridade = prioridadeByMaquina[i];
            prioridadeByMaquina[i].prioridadeEtapa += 1;
            prioridadeEtapa = prioridadeByMaquina[i].prioridadeEtapa;
            break;
          }
        }

        if (Object.entries(itemPrioridade).length > 0) {
          prioridadeEtapa = itemPrioridade.prioridadeEtapa;
        } else {
          prioridadeByMaquina.push({
            id: `${itemUpdate.statusEtapa}-${itemUpdate.maquina}`,
            prioridadeEtapa: 1,
          });
        }
        // console.log(prioridadeByMaquina);
        // console.log(prioridadeEtapa);

        // return res.status(200).json({ msg: '' });
        console.log('vai atualizar: ', itemUpdate.id);
        await OrderProdMaquina.query().where('id', itemUpdate.id).update({
          statusEtapa: itemUpdate.statusEtapa,
          prioridadeEtapa: prioridadeEtapa,
          index: itemUpdate.index,
        });
        // await OrderProdMaquina.update({ id: itemUpdate.id }).set({
        //   statusEtapa: itemUpdate.statusEtapa,
        //   prioridadeEtapa: prioridadeEtapa,
        //   index: itemUpdate.index,
        // }).meta({fetch: true});
        console.log('atualizou..: ', itemUpdate.id);
      }
      // const updated = await OrderProdMaquina.update(listUpdate);
      const lista = await getPrioridades(idMaquina);
      console.log('finalizou...');
      return response.status(200).json(lista);

    } catch (error) {
      console.log(error);
    }
  }

  async changeStatusMaq({request, response}) {
    const b =  request.all();
    const {rows, type} = b;
    
    for (const iterator of rows) {
      await OrderProdMaquina.query().where({ id: iterator.id }).update({
        statusEtapa: type,
      });
    }


  }

  async changePriorMaq({request, response}) {
    const b =  request.all();
    const {rows, idMaquina} = b;
    

    console.log(rows);

    const insert = (arr, index, newItem) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index)
    ]

    
    try {
      console.log('idMaquina', idMaquina);
      let prioridadeByMaquina = [];

      let listUpdate = rows

      let query = `select * from orderprodmaquina where "statusEtapa" <> 'finalizada' and (maquina = '${idMaquina}' or montagem = '${idMaquina}') order by "prioridadeEtapa" ASC`
      const originalArray = await Database.raw(query);

    

      let arrayMod = originalArray.rows;

      for await (const itemUpdate of listUpdate) {
        const found = arrayMod.find(el =>  el.id === itemUpdate.id);
        const oldIndex = arrayMod.findIndex(i => i.id === itemUpdate.id);;
        const moveToIndex = itemUpdate.prioridadeEtapa - 1;
        
        arraymove(arrayMod,oldIndex,moveToIndex)

        
      }
      console.log(arrayMod);
      for await(const rowUpdate  of arrayMod) {
        const foundIndex = arrayMod.indexOf(rowUpdate);
        const indexToOne = foundIndex + 1;
        await OrderProdMaquina.query().where('id',rowUpdate.id).update({
          prioridadeEtapa: indexToOne,
          index: indexToOne,
        })
      }


      const lista = await getPrioridades(idMaquina);
      console.log('finalizou...');
      return response.status(200).json(lista);

    } catch (error) {
      console.log(error);
    }


  }

}


function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

async function getPrioridades(idMaquina, dataProdIni, dataProdFim, dataEntregaFim, dataEntregaIni) {
  try {
    var where = `opm."statusEtapa" != 'finalizada' and op.status != 'finalizada'`;
    if (idMaquina !== 'undefined' && idMaquina !== '') {
      where += ` and ( lower(opm.maquina) = lower('${idMaquina}') or lower(opm.montagem) = lower('${idMaquina}') )`;
    }

    if(dataProdIni !== undefined && dataProdIni !== '') {
      where += ` and ( op."dataProd" = '${moment(dataProdIni.replace(/['"]+/g, '')).format('DD-MM-YYYY')}')`;
    }
    if(dataProdFim !== undefined && dataProdFim !== ''){
      where += `and (op."dataProd" <= '${moment(dataProdFim.replace(/['"]+/g, '')).format('DD-MM-YYYY')}')`;
    }

    if(dataEntregaIni !== undefined && dataEntregaIni !== '') {
      where += ` and ( op."dataEntrega" >= '${moment(dataEntregaIni.replace(/['"]+/g, '')).format('DD-MM-YYYY')}')`;
    }
    if(dataEntregaFim !== undefined && dataEntregaFim !== ''){
      where += `and (op."dataEntrega" <= '${moment(dataEntregaFim.replace(/['"]+/g, '')).format('DD-MM-YYYY')}')`;
    }


    // const lista = await OrderProdMaquina.find({
    //   where: {
    //     orderProd: { '!=': null },
    //   },
    // })
    //   .sort('prioridadeEtapa ASC')
    //   .populate('orderProd')
    //   .then((quiz) => {
    //     return nestedPop(quiz, {
    //       orderProd: ['product'],
    //     });
    //   });
    var SQL = `
      select opm.id,
      opm."orderProd",
      opm."codEtapas",
      op."orderProduction",
      op."ordemPrincipal",
      opm.maquina,
      opm.montagem,
      op.status,
      i.cod AS product,
      i.description1,
      op.prioridade,
      opm."statusEtapa",
      opm."prioridadeEtapa",
      op.qtde,
      op."pedidoCliente",
      op."orderFox",
      op."dataEntrega",
      op."dataProd",
      p.razao_social as cliente
      from "orderprodmaquina" as opm
      inner join orderProd as op on op.id = opm."orderProd"
      inner join product i on i.id = op.product
      inner join partner p on p.id = op.partner
      where ${where}
      order by opm."prioridadeEtapa", opm.index asc 
      limit 100`;

    console.log(SQL);
    const lista = await Database.raw(SQL);

    return lista.rows;

  } catch (error) {
    console.log(error);
  }
}


module.exports = PrioridadeController

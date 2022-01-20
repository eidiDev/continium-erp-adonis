'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with orderprods
 */
const moment = require('moment');
const axios = require('axios');

const ScaffoldController = use('ScaffoldController');

const model = use("App/Models/OrderProd");
const ListaPedidoFox = use("App/Models/Listapedidofox");
const OrderProdMaquina = use("App/Models/OrderProdMaquina");
const MachineLabor = use("App/Models/MachineLabor");
const Timeandcusto = use("App/Models/Timeandcusto");
const Kit = use("App/Models/Kit");
const Product = use("App/Models/Product");
const stepXprod = use("App/Models/Stepxprod")
const Partner = use("App/Models/Partner")
const Database = use('Database');
const OrderProdService = use ('App/Services/OrderProdService')


let listaDeKitsOnCreateOrder = [];

class OrderProdController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }

  async store({ request, response }) {
    let body = request.all();
    console.log('Start: ', new Date().toTimeString());

     var jsonEtapas = JSON.stringify(body.etapas);
     var jsonComponents = JSON.stringify(body.components);

     body.etapas = jsonEtapas;
     body.components = jsonComponents;

    try {
      const orderprod = await this.resource.model.create(body);

      if (orderprod) {
        orderprod.orderProduction = `OP-${('00000' + orderprod.id).slice(-6)}`;

        const orderUpdate = await this.resource.model.
          query().where('id', orderprod.id).update({ orderProduction: orderprod.orderProduction }).returning('*');

        if (orderUpdate.length != 0) {
          console.log('Atualizou, vao criar as etapas: ', new Date().toTimeString());
          let objEtapa = {};
          for (const iterator of JSON.parse(orderprod.etapas)) {
            objEtapa.orderProd = orderprod.id;
            objEtapa.codEtapas = iterator.etapas;
            objEtapa.prioridadeEtapa = iterator.prioridadeEtapa;
            objEtapa.maquina = iterator.maquina;
            objEtapa.montagem = iterator.montagem;
            objEtapa.operador = iterator.operador;
            objEtapa.tempoOperador = iterator.tempoOperador;
            objEtapa.tempoProgramador = iterator.tempoProgramador;
            objEtapa.programador = iterator.programador;
            objEtapa.statusEtapa =
              iterator.statusEtapa !== '' &&
                iterator.statusEtapa !== undefined
                ? iterator.statusEtapa
                : 'planejada';
            objEtapa.tempoMaquina = iterator.tempoMaquina;
            objEtapa.tempoMontagem = iterator.tempoMontagem;
            objEtapa.sequencia = iterator.sequencia;

            await OrderProdMaquina.create(objEtapa);

          }


          console.log('Fim do update: ', new Date().toTimeString());

          calculoTempoEcusto(orderprod);

          const ord = await this.resource.model.query()
            .select(this.resource.model.visible)
            .where('id', orderprod.id)
            .first()
          
          await ord.reload();
          await ord.loadMany(this.resource.model.with)

          console.log('Fim CERTo: ', new Date().toTimeString());
          return response.status(200).json(ord);
        }
      }
    } catch (error) {
      console.log(error);
    }
    console.log('Fim: ', new Date().toTimeString());
  }

  async oncreateOrders({ request, response }) {
    const b = request.all();

    listaDeKitsOnCreateOrder = [];
    let listaOfMessages = [];
    let ordemPai = '';

    const rows = b.rows;

    console.log('Init create orders...');
    try {

      for (const iterator of rows) {

        let produtoPai = iterator.Produto.trim();

        let string = `${iterator.Número}-${iterator.Produto.trim()}`;
         console.log('String: ', string);
        let teste = await ListaPedidoFox.findBy('cod', string);
        //console.log(listaDeKitsOnCreateOrder);

        listaDeKitsOnCreateOrder =
          teste === undefined || teste.listaProdutos === undefined
            ? []
            : teste.listaProdutos;

        let everthingOk = [];
        let ListadeQuemNaotem = [];
        for (const childrenHasStep of listaDeKitsOnCreateOrder) {
          //let seeKit = await Kit.query().where('cod',childrenHasStep.toUpperCase().trim()).fetch();
          let seeKit = await Kit.findBy('cod', childrenHasStep.toUpperCase().trim());
          //let seeKit = await Kit.findOne({ cod: childrenHasStep.toUpperCase().trim() });
          let produto = await Product.findBy('cod', childrenHasStep.toUpperCase().trim());
          // let produto = await Product.findOne({
          //   cod: childrenHasStep.toUpperCase().trim(),
          // });

          let step = await stepXprod.findBy('product', produto.id);
          //let step = await stepXprod.find({ product: produto.id }).limit(1);

          if (seeKit) {
            if (step === undefined || step === null) {
              everthingOk.push({ status: 'Erro', produto: produto.cod });
            } else {
              everthingOk.push({ status: 'Ok', produto: produto.cod });
            }
          } else {
            ListadeQuemNaotem.push(childrenHasStep);
          }
        }
        // console.log('listadekits oncreate order,', listaDeKitsOnCreateOrder);

        // _.remove(listaDeKitsOnCreateOrder, (o) => {
        //     for (const iterator of ListadeQuemNaotem) {
        //         if(iterator === o){
        //             return o === iterator
        //         }
        //     }
        // });

        // let lista2 = listaDeKitsOnCreateOrder.filter((item) => {
        //     console.log('item',item);
        //     for (const iterator of ListadeQuemNaotem) {
        //         if(iterator === item){
        //             return true;
        //         }
        //     }
        //     return false;
        // })
        // console.log('deve r3mover:', ListadeQuemNaotem);
        let lista2 = listaDeKitsOnCreateOrder.filter(function (itm) {
          return ListadeQuemNaotem.indexOf(itm) == -1;
        });

        // console.log('evens',evens);
        // console.log('listadekits oncreate order removido,', lista2);

        let checkIfHasError = everthingOk.find((ind) => ind.status === 'Erro');

        if (checkIfHasError) {
          for (const check of everthingOk) {
            if (check.status === 'Erro') {
              let p = listaOfMessages.find(
                (pAlready) => pAlready.produto === check.produto
              );

              if (p) {
              } else {
                listaOfMessages.push(
                  `Produto: ${check.produto} não tem Etapa cadastrada.`
                );
              }
            }
          }
        } else {
          // console.log('listaDeKitsOnCreateOrder', listaDeKitsOnCreateOrder);
          ordemPai = '';
          for (const speProdsWithKit of lista2) {
            let objOrdem = {};
            let produto = await Product.findBy('cod', speProdsWithKit.trim());
            let step = await stepXprod.findBy('product', produto.id);
            let kit = await Kit.findBy('cod', speProdsWithKit.trim());
            let cliente = await Partner.findBy('name', iterator.Empresa);
            let aux = iterator['Pedido do Cliente'];
            if (aux === null || aux === undefined) {
              aux = '';
            }

            //console.log(speProdsWithKit);

            let dataFormatada = moment(iterator.dataPrevista).utc().format(
              'DD-MM-YYYY'
            );
            let dataFixaProd = '31-12-2050';

            objOrdem.product = produto.id;
            objOrdem.establishments = 1;
            objOrdem.partner = cliente.id;
            objOrdem.pedidoCliente = aux;
            objOrdem.orderFox = iterator.Número;
            objOrdem.unity = produto.unity;
            objOrdem.qtde = iterator.qty;
            objOrdem.description = produto.description1;
            objOrdem.dataEntrega = dataFormatada;
            objOrdem.dataProd = dataFixaProd;
            objOrdem.dataProdEnd = dataFixaProd;
            objOrdem.status = 'planejada';
            objOrdem.itemOrderFox = iterator.Item;

            console.log(objOrdem);

            if (speProdsWithKit === produtoPai) {
              objOrdem.ordemPrincipal = 'Principal';
            } else {
              objOrdem.ordemPrincipal = ordemPai;
            }

            if (step === null) {
              objOrdem.etapas = '';
            } else {
              for (const stepsIn of step.steps) {
                stepsIn.prioridadeEtapa = 1;
                stepsIn.statusEtapa = 'planejada';
              }

              objOrdem.etapas = step.steps;
            }
            if (kit !== undefined || kit !== null) {
              if (kit.products !== undefined) {
                for (const insideKit of kit.products) {
                  insideKit.qtde = insideKit.qtde * iterator.qty;
                }
              }
              objOrdem.components = kit.products;
            }

            // let nativeCall = await sails.sendNativeQuery(
            //   'SELECT MAX(prioridade) from orderprod',
            //   []
            // );

            const maximum = await this.resource.model.query().max('prioridade');

            let ultimaPrioridade = maximum[0].max;

            objOrdem.prioridade = ultimaPrioridade + 1;

            // let request2 = {
            //   url: '/orderprod',
            //   method: 'POST',
            //   data: objOrdem,
            //   json: true,
            // };


            let orderprod;

            // const request = {
            //   uri: `http://localhost:1337/orderprod/`,
            //   method: 'POST',
            //   body: objOrdem,
            //   json: true,
            // };

            // console.log(objOrdem);

            console.log("indo no post");

            objOrdem.components = JSON.stringify(objOrdem.components);
            objOrdem.etapas = JSON.stringify(objOrdem.etapas);

            const orderData = await OrderProdService.criarOrdem(objOrdem);
            console.log(orderData);
            // const test = await axios.post('http://192.168.153.130:1339/orderprod', objOrdem);
            console.log("terminou post");
            orderprod = orderData

            listaOfMessages.push(
              `Ordem :${orderprod.orderProduction} criada do Produto: ${produto.cod}`
            );

            console.log('ordem criado...');

            if (objOrdem.ordemPrincipal === 'Principal') {
              ordemPai = orderprod.orderProduction;
            }

          }
        }
      }
    } catch (error) {
      console.log(error);

      return response.status(400).json('Error ao criar Ordens');      
    }
    console.log('Encerrando on create orders.');

    return response.status(200).json(listaOfMessages);
  }


  async gerenciarOrdens({ request, response }) {
    const record = request.all();
    let req = {
      body: request.all()
    }

    console.log(req.body);
    let dataProdIni = '01-01-1960',
      dataProdFim = '31-12-2100',
      dataEntregaIni = '01-01-1960',
      dataEntregaFim = '31-12-2100';
    if (
      req.body.order.dataProdIni !== '' &&
      req.body.order.dataProdIni !== undefined
    )
      dataProdIni =
        req.body.order.dataProdIni.split('T')[0].toString().substr(8, 2) +
        '-' +
        req.body.order.dataProdIni.split('T')[0].toString().substr(5, 2) +
        '-' +
        req.body.order.dataProdIni.split('T')[0].toString().substring(0, 4);
    if (
      req.body.order.dataProdFim !== '' &&
      req.body.order.dataProdFim !== undefined
    )
      dataProdFim =
        req.body.order.dataProdFim.split('T')[0].toString().substr(8, 2) +
        '-' +
        req.body.order.dataProdFim.split('T')[0].toString().substr(5, 2) +
        '-' +
        req.body.order.dataProdFim.split('T')[0].toString().substring(0, 4);
    if (
      req.body.order.dataEntregaIni !== '' &&
      req.body.order.dataEntregaIni !== undefined
    )
      dataEntregaIni =
        req.body.order.dataEntregaIni.split('T')[0].toString().substr(8, 2) +
        '-' +
        req.body.order.dataEntregaIni.split('T')[0].toString().substr(5, 2) +
        '-' +
        req.body.order.dataEntregaIni.split('T')[0].toString().substring(0, 4);
    if (
      req.body.order.dataEntregaFim !== '' &&
      req.body.order.dataEntregaFim !== undefined
    )
      dataEntregaFim =
        req.body.order.dataEntregaFim.split('T')[0].toString().substr(8, 2) +
        '-' +
        req.body.order.dataEntregaFim.split('T')[0].toString().substr(5, 2) +
        '-' +
        req.body.order.dataEntregaFim.split('T')[0].toString().substring(0, 4);

    let prioridadeEtapaIni = 0,
      prioridadeEtapaFim = 99999;
    if (
      req.body.order.prioridadeEtapaIni !== '' &&
      req.body.order.prioridadeEtapaIni !== undefined
    )
      prioridadeEtapaIni = req.body.order.prioridadeEtapaIni;
    if (
      req.body.order.prioridadeEtapaFim !== '' &&
      req.body.order.prioridadeEtapaFim !== undefined
    )
      prioridadeEtapaFim = req.body.order.prioridadeEtapaFim;

    let {
      dataProd,
      dataEntrega,
      establishments,
      partner,
      product,
      status,
      orderProduction,
      ordemPrincipal,
      prioridade,
      orderFox,
      pedidoCliente,
    } = record;

    if (ordemPrincipal === undefined) {
      ordemPrincipal = '';
    }

    try {
      var ordersComSelect = await this.resource.model.query().where((builder) => {
        if (orderProduction) {
          builder.where('orderProduction', orderProduction)
        }
        if (pedidoCliente) {
          builder.where('pedidoCliente', pedidoCliente)
        }

        if (orderFox) {
          builder.where('orderFox', orderFox)
        }

        builder.where((build) => {
          build.where('prioridade', '>=', prioridadeEtapaIni)
            .where('prioridade', '<=', prioridadeEtapaFim)
        });

        // builder.where((build) => build.where('ordemPrincipal', 'like',ordemPrincipal)
        // .where('orderProduction','like',ordemPrincipal));

        builder.where((build) => {
          build.where('dataProd', '>=', dataProdIni)
            .where('dataProd', '<=', dataProdFim)
        });

        if (establishments) {
          builder.where('establishments', establishments)
        }
        if (partner) {
          builder.where('partner', partner)
        }
        if (product) {
          builder.where('product', product)
        }

        if (status.length != 0) {
          builder.where('status', status)
        }
      }).with('productObj')
        .with('partnerObj')
        .with('establishmentsObj')
        .with('apontamentos')
        .with('tempoEcustos').fetch();

    } catch (error) {
      console.log(error);
    }

    if (
      req.body.order.productCateg !== '' &&
      req.body.order.productCateg !== undefined
    ) {
      ordersComSelect = ordersComSelect.filter(
        (e) => e.product.category === req.body.order.productCateg
      );
    }

    // console.log('ordersComSelect',ordersComSelect);
    console.log('resultados: ', ordersComSelect.length);
    return response.status(200).json(ordersComSelect);
  }

  async update({ request, response }) {
    try {
      let b = request.all();

      const { id } = request.params;
      b.id = id;
      await tratamentoUpdate(b, b);

      console.log(request.all());

      let test =  request.all();
      test.components = JSON.stringify(test.components);
      test.etapas = JSON.stringify(test.etapas);

      const updateRow = await this.resource.model.query()
        .where('id', id).update(test);

      if (updateRow === 1) {
        const op = await this.resource.model.query().where('id', id)
          .first();
        
        await op.reload();
        await op.loadMany(this.resource.model.with);
        await UpdateDecalculoEcusto(op);

        return response.status(200).json(op);

      }
    } catch (error) {
      console.log(error);
    }
  }

  async calculateCustOnOrder({ request, response }) {
    const order = request.all();
    // console.log(req.query);
    let lista = [];
    let listaMessagesDataB = [];

    for (let index = 0; index < order.etapas.length; index++) {
      var element = order.etapas[index];

      if (typeof element === 'string') {
        var obj = JSON.parse(element);
        lista.push(obj);
      }
    }

    order.etapas = lista;

    let retorno = await UpdateDecalculoEcusto(order);

    for (const key in retorno) {
      if (retorno.hasOwnProperty(key)) {
        const element = retorno[key];
        if (key === 'custoPrevisto') {
          listaMessagesDataB.push(
            `Custo previsto atualizado para: "${element}"`
          );
        }

        if (key === 'tempoPrevisto') {
          listaMessagesDataB.push(
            `Tempo previsto atualizado para: "${element}"`
          );
        }
      }
    }

    return response.status(200).json(listaMessagesDataB);
  }

  async getSearch({ request, response }) {
    let req = {
      query: request.all()
    }
    let str = req.query.searchText;
    let coluna = req.query.searchedColumn;

    var getSea;

    try {
      if (coluna === 'orderProduction') {
        getSea = await this.resource.model
          .query().where('orderProduction', 'like', `%${str}%`)
          .with('productObj')
          .with('partnerObj')
            .with('establishmentsObj')
            .with('apontamentos')
            .with('tempoEcustos')
            .fetch()
          .fetch();

        // getSea = await OrderProd.find({
        //   orderProduction: { contains: str }
        // }).populate('establishments')
        // .populate('product')
        // .populate('partner')
        // .populate('apontamentos')
        // .populate('tempoEcustos');
      } else {
        if (coluna === 'dataProd') {
          getSea = await this.resource.model
            .query().where('dataProd', '=', `%${str}%`)
            .with('productObj')
            .with('partnerObj')
            .with('establishmentsObj')
            .with('apontamentos')
            .with('tempoEcustos')
            .fetch();

          // getSea = await OrderProd.find({
          //   dataProd: { contains: str }
          // }).populate('establishments')
          // .populate('product')
          // .populate('partner')
          // .populate('apontamentos')
          // .populate('tempoEcustos');
        }
      }

      if (coluna === 'partnerObj.name') {
        str = str + '%'
        let query = `select p.id from orderprod p inner join partner ca on p.partner = ca.id where ca.name like '${str}'`

        let nativeCall = await Database.raw(query)

        let linhas = nativeCall.rows
        let array = [];
        for (const iterator of linhas) {
          let pr = await this.resource.model.query().where({ id: iterator.id })
            .with('productObj')
            .with('partnerObj')
            .with('establishmentsObj')
            .with('apontamentos')
            .with('tempoEcustos')
            .fetch()

          array.push(pr.rows[0]);
        }
        getSea = array
      }

      if (coluna === 'productObj.cod') {
        str = str + '%'
        let query = `select p.id from orderprod p inner join product ca on p.product = ca.id where ca.cod like '${str}'`

        let nativeCall = await Database.raw(query)

        let linhas = nativeCall.rows
        let array = [];
        for (const iterator of linhas) {
          let pr = await this.resource.model.query().where({ id: iterator.id })
            .with('productObj')
            .with('partnerObj')
            .with('establishmentsObj')
            .with('apontamentos')
            .with('tempoEcustos')
            .fetch();

          array.push(pr.rows[0]);
        }
        getSea = array
      }
    } catch (error) {
      console.log(error);
    }

    return response.status(200).json(getSea);
  }

  async getTotal ({request, response}) {
    let nativeCall = await this.resource.model.query().count();

    let total = nativeCall;
    total.count = parseInt(total.count);

    return response.status(200).json(total);

  }
}


async function tratamentoUpdate(orderOriginal, orderModificada) {
  console.log('trateamnto Update...');
  try {
    let listaDaOrdemNaTabelaOrderMaquina = await OrderProdMaquina.query()
      .where('orderProd', orderOriginal.id).fetch();
    listaDaOrdemNaTabelaOrderMaquina = listaDaOrdemNaTabelaOrderMaquina.rows
    // const listaDaOrdemNaTabelaOrderMaquina = await OrderProdMaquina.find({
    //   orderProd: orderOriginal.id,
    // });

    let jayson;

    if (typeof orderModificada.etapas === 'string') {
      jayson = JSON.parse(orderModificada.etapas);
    } else {
      if (typeof orderModificada.etapas === 'object') {
        jayson = orderModificada.etapas;
      }
    }

    console.log('aqui');

    let listToDelete = [];
    for (const item of listaDaOrdemNaTabelaOrderMaquina) {
      if (item.statusEtapa === 'planejada' || item.statusEtapa === 'liberada') {
        let exists = null;
        for (const newItem of jayson) {
          exists =
            newItem.etapas === item.codEtapas &&
            newItem.sequencia === item.sequencia;
          if (exists) {
            break;
          }
        }
        if (!exists) {
          listToDelete.push(item.id);
        }
      }
    }
    //Remove os registros do banco de dados
    if (listToDelete.length > 0) {
      await OrderProdMaquina.query().whereIn('id', listToDelete).delete();
    }

    //Verificar se a ordem atualizada com os etapas modificadas ou nao, se contem a tabela orderProdMaquina.
    //Na criacao de uma ordem, a logica percorre a lista de etapas da ordem e cria registros na tabela orderProdMaquina com o Id da ordem.

    console.log('aqui 2');

    for (const iterator of jayson) {
      let findReg = await OrderProdMaquina.query().where({
        orderProd: orderOriginal.id,
        codEtapas: iterator.etapas,
        sequencia: iterator.sequencia,
      }).fetch();
      findReg = findReg.rows

      //Primeiro verifica se o registro existe, se existir ele vai atualizar ele
      if (findReg.length > 0) {
        for (const iterator2 of findReg) {
          if (iterator2.id === iterator.id) {
            if (iterator.maquina === '') {
              await OrderProdMaquina.query()
                .where({ id: iterator2.id })
                .update({ montagem: iterator.montagem, maquina: '' });
              //await OrderProdMaquina.updateOne({ id: iterator2.id }).set({ montagem: iterator.montagem, maquina: '' })
            } else {
              await OrderProdMaquina.query()
                .where({ id: iterator2.id })
                .update({ maquina: iterator.maquina, montagem: '' });
              //await OrderProdMaquina.updateOne({ id: iterator2.id }).set({ maquina: iterator.maquina, montagem: '' })
            }
          }
        }
        //Verficar se registro foi modificado ou excluido
        // let verModEx = OrderProdMaquina.find({
        //   orderProd: orderOriginal.id,
        //   codEtapas: iterator.codEtapas,
        // });
        // if (verModEx.length === 0) {
        //   //Foi Excluido
        // } else {
        //   //Foi mudado
        // }
      } else {
        //Se nao existe ele vai criar ele
        let objEtapa = {};
        // objEtapa.key = Math.round(Math.random(0, 30000) * 1000);
        objEtapa.orderProd = orderOriginal.id;
        objEtapa.codEtapas = iterator.etapas;
        objEtapa.prioridadeEtapa = iterator.prioridadeEtapa
          ? iterator.prioridadeEtapa
          : 1;
        objEtapa.maquina = iterator.maquina;
        objEtapa.montagem = iterator.montagem;
        objEtapa.operador = iterator.operador;
        objEtapa.tempoOperador = iterator.tempoOperador;
        objEtapa.tempoProgramador = iterator.tempoProgramador;
        objEtapa.programador = iterator.programador;
        objEtapa.statusEtapa =
          iterator.statusEtapa !== '' && iterator.statusEtapa !== undefined
            ? iterator.statusEtapa
            : 'planejada';
        objEtapa.tempoMaquina = iterator.tempoMaquina;
        objEtapa.tempoMontagem = iterator.tempoMontagem;
        objEtapa.sequencia = iterator.sequencia;

        await OrderProdMaquina.create(objEtapa);
      }
    }

    //Reordena todas as prioridades
    for (const speMaquina of listaDaOrdemNaTabelaOrderMaquina) {
      let maquina =
        speMaquina.maquina === '' ? speMaquina.montagem : speMaquina.maquina;

      if (maquina !== '') {
        let lista = await OrderProdMaquina.query()
          .where('montagem', 'like', maquina)
          .orWhere('maquina', 'like', maquina)
          .orderBy('prioridadeEtapa', 'asc')
          .with('orderProdObj', (om) => { om.as('orderprod') })
          .fetch();
        lista = lista.rows;

        // let lista = await OrderProdMaquina.find({
        //   or: [
        //     { montagem: { contains: maquina } },
        //     { maquina: { contains: maquina } },
        //   ],
        // })
        //   .sort('prioridadeEtapa ASC')
        //   .populate('orderProd');

        lista = lista.sort(function (a, b) {
          if (
            a.orderProdObj === undefined ||
            a.orderProdObj === null ||
            b.orderProdObj === undefined ||
            b.orderProdObj === null
          ) {
            return 0;
          } else {
            if (
              moment(a.orderProdObj.dataEntrega, 'DD-MM-YYYY') >
              moment(b.orderProdObj.dataEntrega, 'DD-MM-YYYY')
            ) {
              return 1;
            }
            if (
              moment(a.orderProdObj.dataEntrega, 'DD-MM-YYYY') <
              moment(b.orderProdObj.dataEntrega, 'DD-MM-YYYY')
            ) {
              return -1;
            }
            return 0;
          }
        });

        // let lista2 = await OrderProdMaquina.find({
        //   or: [
        //     { montagem: { contains: maquina } },
        //     { maquina: { contains: maquina } },
        //   ],
        // })
        //   .sort('prioridadeEtapa ASC')
        //   .populate('orderProd');

        let lista2 = await OrderProdMaquina.query()
          .where('montagem', 'like', maquina)
          .where('statusEtapa', '<>', 'finalizada')
          .orWhere('maquina', 'like', maquina)
          .orderBy('prioridadeEtapa', 'asc')
          .with('orderProdObj', (om) => { om.as('orderprod') })
          .fetch();
        lista2 = lista2.rows;

        console.log('aqui 4');
        if (JSON.stringify(lista) === JSON.stringify(lista2)) {
          let i = 1;
          for (const caseChange of lista) {
            if (
              caseChange.prioridadeEtapa > 0 &&
              (speMaquina.statusEtapa === 'planejada' ||
                speMaquina.statusEtapa === 'liberada')
            ) {
              await OrderProdMaquina.query().where({ id: caseChange.id }).update({
                prioridadeEtapa: i,
              });
              // await OrderProdMaquina.update({ id: caseChange.id }).set({
              //   prioridadeEtapa: i,
              // });
              i += 1;
            }
          }
        } else {
          console.log('1');
        }
      } else {
      }
    }
  } catch (error) {
    console.log(error);
  }
  //Fim da reordenacao das prioridades etapas
}



/**
--Filtramos para pegar as etapas do tipo 'Maquina' e 'Montagem'
--A partir das etapas filtradas buscamos no cadastro de machinelabor o cadastro da maquina/montagem
--No cadastro da machinelabor o campo rateTimeRelation que é o ID do registro na tabela taxahora
--Dentro do taxahor tempos o campo valor
--Pegamos o valor da taxa hora e dividimos por 60
--Pegamos o tempo da etapa e multiplicamos pela quantidade da ordem
--Pegamos o resultado e multiplicamos pelo tempominuto
 */
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

  let listadeEtapas = JSON.parse(order.etapas);

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


async function UpdateDecalculoEcusto(order) {
  let objTocreate = {
    orderProd: '',
    tempoPrevisto: '',
    custoPrevisto: ''
  };
  // colocando o id da ordem
  objTocreate.orderProd = order.id;

  let jayson;
  if (typeof order.etapas === 'string') {
    jayson = JSON.parse(order.etapas);
  } else {
    if (typeof order.etapas === 'object') {
      jayson = order.etapas;
    }
  }
  let listadeEtapas = jayson;

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

  let objTempo = await Timeandcusto.findOrCreate(
    { orderProd: order.id },
    objTocreate
  );

  objTocreate.id = objTempo.id;

  let returnObj = await Timeandcusto.query().where({ orderProd: order.id }).update(objTocreate).returning('*');

  if (returnObj.length != 0) {
    return returnObj[0];
  }
}

module.exports = OrderProdController

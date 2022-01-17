'use strict'

const Kit = use("App/Models/Kit");
const stepXprod = use("App/Models/Stepxprod");
const Product = use("App/Models/Product");
const OrderProd = use("App/Models/OrderProd");

const axios = require('axios');
const url_orderprod = 'http://192.168.153.130:1339/orderprod'

class ExplosiveOrderController {

    async createOrdersKits ({request,response}) {
        let req = {
            body: request.all()
        }

        let ordersCreated = [];

        const array = req.body.arrayProdutos;
        const record = req.body.record;
    
        let produtoPaiComKit = await Kit.query().where('product', record.product).fetch()
        let produtoPaiComStep = await stepXprod.query().where('product', record.product).fetch()

        produtoPaiComKit = produtoPaiComKit.rows[0].toJSON();
        produtoPaiComStep = produtoPaiComStep.rows[0].toJSON();
    

        
        console.log(produtoPaiComKit, produtoPaiComStep);
    
        let base = 0;
        let a = 0;
        let b = 0;
    
        base = produtoPaiComKit.qtdebase;
    
        for (const iterator of produtoPaiComKit.products) {
          a = iterator.qtde * parseInt(record.qtde);
          b = a / base;
    
          iterator.qtde = b;
        }
    
        produtoPaiComKit.qtdebase = parseInt(record.qtde);
    
        let tempoPrevistoTotal = 0;
        let resultadoTotal = 0;
        let somdadaTaxahora = 0;
    
        if (produtoPaiComStep === undefined) {
        } else {
          produtoPaiComStep.steps.forEach((stp) => {
            tempoPrevistoTotal =
              parseInt(stp.tempoMaquina) +
              parseInt(stp.tempoMontagem) +
              parseInt(stp.tempoOperador) +
              parseInt(stp.tempoProgramador);
            resultadoTotal += tempoPrevistoTotal * record.qtde;
          });
        }
    
        let teste = produtoPaiComKit.products;
    
        let objProdutoPai = {
          orderProduction: produtoPaiComKit.id,
          status: 'planejada',
          establishments: record.establishment,
          pedidoCliente: record.pedidoCliente,
          orderFox: record.orderFox,
          product: produtoPaiComKit.product,
          description: produtoPaiComKit.name,
          partner: record.partner,
          dataEntrega: record.dataEntrega,
          dataProd: record.dataProd,
          ordemPrincipal: 'Principal',
          qtde: record.qtde,
          unity: produtoPaiComKit.unity,
          components:
            produtoPaiComKit === undefined
              ? ''
              : produtoPaiComKit.products === undefined
              ? ''
              : teste,
          //etapas: produtoPaiComStep.stepXprod.length === 0 ? "" : produtoPaiComStep.stepXprod[0].steps === undefined ? "" : produtoPaiComStep.stepXprod[0].steps
        };
    
        for (const iterator of produtoPaiComKit.products) {
          for (const iterator2 of array) {
            if (iterator.produto === iterator2.cod) {
              iterator.qtde = iterator2.qtdebase;
            }
          }
        }
    
        objProdutoPai.components =
          produtoPaiComKit === undefined
            ? ''
            : produtoPaiComKit.products === undefined
            ? ''
            : produtoPaiComKit.products;
    
        if (produtoPaiComStep === undefined) {
        } else {
          if (produtoPaiComStep.steps === undefined) {
          } else {
            for (const iterator of produtoPaiComStep.steps) {
              iterator.prioridadeEtapa = 1;
              iterator.statusEtapa = 'planejada';
            }
          }
        }
    
        objProdutoPai.etapas =
          produtoPaiComStep === undefined
            ? ''
            : produtoPaiComStep.steps === undefined
            ? ''
            : produtoPaiComStep.steps;
    
        let listaDeOrdens = await OrderProd.query().orderBy('prioridade', 'asc').fetch();
        //console.log(listaDeOrdens);
        if (listaDeOrdens.rows.length === 0) {
          objProdutoPai.prioridade = 1;
        } else {
          const [lastNumber] = listaDeOrdens.rows.slice(-1);
          objProdutoPai.prioridade = lastNumber.prioridade + 1;
        }
    
        // const request = {
        //   url: '/orderprod',
        //   method: 'POST',
        //   data: objProdutoPai,
        // };
    
        let orderprodPai;

        objProdutoPai.etapas = JSON.stringify(objProdutoPai.etapas)
        objProdutoPai.components = JSON.stringify(objProdutoPai.components)
        async function fazReq() {
          return new Promise(async (resolve, reject) => {
            let orderprod;
            let resultdata = await axios.post(url_orderprod,objProdutoPai);
            orderprod = resultdata.data;
            console.log(orderprod);
            // await sails.request(request, (err, response, body) => {
            //   orderprodPai = body;
            //   ordersCreated.push('Ordem criada: ' + body.orderProduction);
            //   resolve();
            // });
            if(orderprod){
                orderprodPai = orderprod;
                ordersCreated.push('Ordem criada: ' + orderprod.orderProduction);
                resolve();
            }
       
          });
        }
        await fazReq().then(async () => {
          let auxPrioridade;
          let auxTrava = 0;
          for (const element of array) {
            let arrayteste = [];
            let prodComKit = await Kit.query().where('product', element.product).fetch();
            let prodComStep = await stepXprod.query().where('product', element.product).fetch()

            prodComKit = prodComKit.rows[0].toJSON();
            prodComStep = prodComStep.rows[0].toJSON();
        
            prodComKit.products.forEach((p) => {
              arrayteste.push(p);
            });
    
            arrayteste.forEach((prods) => {
              prods.qtde = prods.qtde * parseInt(record.qtde);
            });
    
            if (prodComStep === undefined) {
            } else {
              if (prodComStep.steps === undefined) {
              } else {
                for (const iterator of prodComStep.steps) {
                  iterator.prioridadeEtapa = 1;
                  iterator.statusEtapa = 'planejada';
                }
              }
            }
    
            let objjson = {
              orderProduction: element.id,
              status: 'planejada',
              pedidoCliente: record.pedidoCliente,
              establishments: record.establishment,
              product: element.product,
              description: prodComKit.description1,
              partner: record.partner,
              dataProd: record.dataProd,
              dataEntrega: record.dataEntrega,
              orderFox: record.orderFox,
              ordemPrincipal: await orderprodPai.orderProduction,
              qtde: record.qtde,
              unity: prodComKit.unity,
              components:
                prodComKit === undefined
                  ? ''
                  : prodComKit.products === undefined
                  ? ''
                  : arrayteste,
              etapas:
                prodComStep === undefined
                  ? ''
                  : prodComStep.steps === undefined
                  ? ''
                  : prodComStep.steps,
            };
    
            // for (const iterator of prodComKit.kit[0].products ) {
            //     for (const iterator2 of array) {
            //         if(iterator2.produto === iterator.cod){
            //             iterator.qtde = iterator2.qtdebase
            //         }
            //     }
            // }
            //objjson.components = prodComKit.kit.length === 0 ? "" : prodComKit.kit[0].products === undefined ? "" : prodComKit.kit[0].products
    
            if (auxTrava === 0) {
              auxPrioridade = orderprodPai.prioridade;
              objjson.prioridade = auxPrioridade + 1;
              auxTrava = 1;
            } else {
              objjson.prioridade = auxPrioridade + 1;
            }
    
            let orderprod;

            objjson.etapas = JSON.stringify(objjson.etapas)
            objjson.components = JSON.stringify(objjson.components)
            async function fazReq2() {
              return new Promise(async (resolve, reject) => {
                let body 
                let resultdata2 = await axios.post(url_orderprod,objjson);
                body = resultdata2.data

                if(body){
                    orderprod = body;
                    ordersCreated.push('Ordem criada: ' + body.orderProduction);
                    resolve();
                }
                
                // await sails.request(request2, (err, response, body) => {
                //   orderprod = body;
                //   ordersCreated.push('Ordem criada: ' + body.orderProduction);
                //   resolve();
                // });
              });
            }
    
            await fazReq2().then(() => {
              auxPrioridade = orderprod.prioridade;
            });
          }
        });
    
    
        response.status(200).json({ msg: 'Ordens Criadas', orders: ordersCreated });
    }

    async getKitArvore ({request,response}) {

        let req = {
            body: request.all()
        }

        let auxArray = [];
        let array = req.body.produto;
        let pai = req.body.pai;
        
        try {

        for (const teste of array) {
          var kit = await Kit.query().where('cod', teste.produto).with('productObj').fetch();
       
          if (kit.rows.length === 0) {
          } else {
            kit.rows[0].qtdebase = teste.qtde;
            auxArray.push(kit.rows[0]);
          }
        }

        for (const filho of auxArray) {
          for (const filhoproducts of filho.products) {
            var kit = await Kit.query().where('cod', filhoproducts.produto).with('productObj').fetch();
            if (kit.rows.length === 0) {
            } else {
              kit.rows[0].qtdebase = filhoproducts.qtde;
              auxArray.push(kit.rows[0]);
            }
          }
        }
    } catch (error) {
        console.log(error);       
    }
    
        response.status(200).json(auxArray);
    }

    async setKitArvore ({request,response}) {
        let req = {
            body: request.all()
        }

        let auxArray = [];
        let array = req.body.produto;
        let pai = req.body.pai;
    
        let listaAuxilio = [];
    

        try {
            
        

        const paiKit = await Kit.findBy( 'product', pai );
        let numero = parseInt(req.body.numero);
        let base = paiKit.qtdebase;
        let aux = 0;
    
        let obj = {
          cod: '',
          qtdebaseAntiga: '',
        };
    
        let a = 0;
        let b = 0;
        let resultado = 0;
    
        for (const teste of array) {
            
          var kit = await Kit.query().where('cod', teste.produto).with('productObj').fetch()
          if (kit.rows.length === 0) {
          } else {
            obj.cod = kit.rows[0].cod;
            obj.qtdebaseAntiga = kit.rows[0].qtdebase;
            listaAuxilio.push(obj);
            obj = {};
            //aux = kit.qtdebase;
            //kit.qtdebase = teste.qtde;
            a = numero * teste.qtde;
            b = a / base;
            resultado = b;
    
            kit.rows[0].qtdebase = resultado;
            numero = kit.rows[0].qtdebase;
            auxArray.push(kit.rows[0]);
            a = 0;
            b = 0;
            resultado = 0;
          }
        }
        for (const filho of auxArray) {
          for (const filhoproducts of filho.products) {
            var kit = await Kit.query().where('cod', filhoproducts.produto).with('productObj').fetch()
            if (kit.rows.length === 0) {
              // filhoproducts.qtde =  filho.qtdebase
            } else {
              obj.cod = kit.rows[0].cod;
              obj.qtdebaseAntiga = kit.rows[0].qtdebase;
              listaAuxilio.push(obj);
              obj = {};
    
              kit.rows[0].qtdebase = filhoproducts.qtde;
    
              for (const iterator of listaAuxilio) {
                if (iterator.cod === filho.cod) {
                  base = iterator.qtdebaseAntiga;
                }
              }
    
              a = numero * kit.rows[0].qtdebase;
              b = a / base;
              resultado = b;
    
              kit.rows[0].qtdebase = resultado;
              numero = kit.rows[0].qtdebase;
              auxArray.push(kit.rows[0]);
              a = 0;
              b = 0;
              resultado = 0;
            }
          }
        }
    
        let somaDosTempos = 0;
        let resultadoDaConta = 0;
        for (const tempo of auxArray) {
          let stepPorProd = await stepXprod.findBy('product', tempo.product);
    
          stepPorProd = stepPorProd;
    
          if (stepPorProd && stepPorProd !== undefined) {
            for (const calculoDoTempo of stepPorProd.steps) {
              somaDosTempos +=
                parseInt(calculoDoTempo.tempoMaquina) +
                parseInt(calculoDoTempo.tempoMontagem) +
                parseInt(calculoDoTempo.tempoOperador) +
                parseInt(calculoDoTempo.tempoProgramador);
            }
            resultadoDaConta = somaDosTempos * tempo.qtdebase;
    
            tempo.tempoPrevisto = resultadoDaConta;
    
            resultadoDaConta = 0;
            somaDosTempos = 0;
          } else {
            tempo.tempoPrevisto = 0;
          }
        }

    } catch (error) {
        console.log(error);       
    }
        response.status(200).json(auxArray);
    }

    async checkIfHasStepKit ({request,response}) {

        let req = {
            query: request.all()
        }

        const {arrayProdutos} = req.query;
        let tamanho = arrayProdutos.length;
        let listaCertos = [];
        let listaErrados = [];
    
        for (const iterator of arrayProdutos) {
            let obj = JSON.parse(iterator);
            let pr = await Product.findBy('cod', obj.cod);
            let check = await stepXprod.findBy('product', pr.id);
    
            if(check != null){
              listaCertos.push(obj);
            }else{
              listaErrados.push('O produto:'+ obj.cod + ' não tem Etapa cadastrada');
            }
        }
    
    
        if(listaCertos.length === tamanho){
          return response.status(200).json({flag: true});
        }else{
          return response.status(200).json({lista:listaErrados });
        }
      }
    
}

module.exports = ExplosiveOrderController

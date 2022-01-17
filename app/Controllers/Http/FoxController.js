'use strict'
const moment = require('moment');
const axios = require('axios');
const sql = require('mssql');
const user = 'ICONNECT';
const pwd = 'Cora@2018';
const url = '201.22.57.246';


const OrderProd = use("App/Models/OrderProd");
const LinhaPedido = use("App/Models/LinSalesOrder") 
const Product = use("App/Models/Product");
const Partner = use("App/Models/Partner");
const Kit = use("App/Models/Kit");
const ListaPedidoFox = use("App/Models/Listapedidofox");
const stepXprod = use("App/Models/Stepxprod");

let listaGlobal = [];
let listaMessagesDataB = [];
let listaDeKitsOnCreateOrder = [];
const url_orderprod = 'http://192.168.153.130:1339/orderprod'
const OrderProdService = use ('App/Services/OrderProdService')

class FoxController {
    async onCreateBasicData ({request,response}) {
        console.log('Inicinou: ', new Date().toISOString());
        const req = request.all();
        const { rows }  = req;
        listaMessagesDataB = [];

        let pool = await sql.connect(`mssql://${user}:${pwd}@${url}/FOX_00001`);
        try {
            
        for (const pedidoVenda of rows) {
          
            //Entrar em cada linha de cada pedido de venda vindo do front na var rows
            //Validar se o pedido de venda tem linhas 
            if(pedidoVenda.linhas.length === 0){
            }else{
                for (const linhaPedidoVenda of pedidoVenda.linhas) {
                  listaGlobal = [];
                    //Verificar os kits do produto principal da linha de pedido
                    let produtoPai = linhaPedidoVenda.productObj.cod.trim().toUpperCase();
                    let queryArvore = `SELECT
                    UPPER(a.Produto) as 'Produto',
                    UPPER(a.Componente) as 'Componente',
                    a.Quantidade,
                    a.Sequencial,
                    a.Data,
                    a.[Data de Exclusão],
                    p.Grupo
                    FROM Árvore as a
                    inner join Produtos as p on p."Código" = a.Produto
                    WHERE a.Produto = '${produtoPai}'
                    ORDER BY a.Produto`;
                    
                    let resultArvore = await pool.request().query(queryArvore);
                    
                    //Validando se exisitir registro dentro da tabela Kit
                    if (resultArvore.recordset.length === 0) {

                        let string = `${linhaPedidoVenda.num_salesorder}-${linhaPedidoVenda.productObj.cod.trim().toUpperCase()}`;
                        let listSpeNoKits = [];
                        listSpeNoKits.push(linhaPedidoVenda.productObj.cod.trim().toUpperCase());
                        
                        let procurar = await ListaPedidoFox.findBy('cod', string );
                        if (procurar) {
                        procurar.listaProdutos = listSpeNoKits;
                        await procurar.save();
                        await procurar.reload();

                        } else {

                            const newListaPedidoFox = new ListaPedidoFox();
                            var myJsonString = JSON.stringify(listSpeNoKits);
                            newListaPedidoFox.cod = string;
                            newListaPedidoFox.listaProdutos = myJsonString;

                            await newListaPedidoFox.save();
                        }

                        listaMessagesDataB.push(`Produto: "${linhaPedidoVenda.productObj.cod.trim().toUpperCase()}" CRIADO !`)

                    } else {
                        //Adicionando em uma lista global os produtos que tiver Kit
                        //A regra e para adicionar somente uma vez os codigo do produto.
                        listaGlobal.push(produtoPai.trim());

                        //For Of para pegar cada componente do Kit do Pai.
                        for (const arvore2 of resultArvore.recordset) {
                        //Criacao de uma promise para o fluxo seguir a ordem que tem que ser seguida.
                            function timeOutPromise() {
                                return new Promise(function (resolve) {
                                //Passando o Codigo do filho do produto Pai para ser checado se ele tem Kit.
                                console.log('verificar se é kit:', arvore2.Componente);
                                resolve(seeIfKit(arvore2.Componente.trim(), 'dadosBasicos'));
                                });
                            }
                            function doSomething() {
                                return timeOutPromise();
                            }

                            await doSomething();
                        }

                        console.log('lista:',listaGlobal);
                        try {
                            let string = `${linhaPedidoVenda.num_salesorder}-${linhaPedidoVenda.productObj.cod.trim().toUpperCase()}`;
                            console.log('Criar registro na ListaPedidoFox: ', string);
                            let procurar = await ListaPedidoFox.findBy( 'cod', string );
                            var myJsonString = JSON.stringify(listaGlobal);

                            if (procurar != null || procurar != undefined) {
                                await ListaPedidoFox.query().where('cod', string).update({
                                    listaProdutos: myJsonString
                                });
                            } else {
                                await ListaPedidoFox.create({
                                cod: string,
                                listaProdutos: myJsonString,
                                });
                            }
                        } catch (error) {
                            console.log(error);
                        }

                        console.log('Vai criar os kits: ', new Date().toISOString());
                        //Criar Kit pros produtos listados pela percorrencia anterior.

                        for (const kit of listaGlobal) {
                            function timeOutPromise() {
                                return new Promise(function (resolve) {
                                //Passando o Codigo do filho do produto Pai para ser checado se ele tem Kit.
                                resolve(creatingKit(kit));
                                });
                            }

                            function doSomething() {
                                return timeOutPromise();
                            }

                            let checkProductKit = await Product.findBy('cod', kit.toUpperCase());

                            if (checkProductKit != null || checkProductKit != undefined ) {
                                await doSomething();
                            } else {
                                let query3 = `SELECT UPPER(Código) as Código , Unidade , Linha01 , Linha02, Linha03, Grupo FROM Produtos p WHERE Código = '${kit}';`;
                                let resultKitPai = await pool.request().query(query3);
                                let pResultSet = resultKitPai.recordset[0];

                                let p = await Product.create({
                                cod: pResultSet.Código,
                                category: pResultSet.Grupo,
                                unity: pResultSet.Unidade,
                                description1: pResultSet.Linha01,
                                description2: pResultSet.Linha02,
                                description3: pResultSet.Linha03,
                                });
                                console.log(`Produto: "${p.cod}" CRIADO !`);
                                listaMessagesDataB.push(`Produto: "${p.cod}" CRIADO !`);

                                await doSomething();
                            }
                        }
                        console.log('Finalizou os kits: ', new Date().toISOString());
                    }
                }
            }
        }
        } catch (error) {
            console.log(error);
        }

        console.log('Encerrou: ', new Date().toISOString());
        return response.status(200).json(listaMessagesDataB);
    }

    async onCreateOrders ({request,response}) {
      const req = request.all();
      const { rows }  = req;
       
      listaDeKitsOnCreateOrder = [];
      let listaOfMessages = [];
      let ordemPai = '';

      try {
        for (const pedidoVenda of rows) {
          if(pedidoVenda.linhas.length === 0){
          }else{
              for (const linhaPedidoVenda of pedidoVenda.linhas) {
                let produtoPai = linhaPedidoVenda.productObj.cod.trim();
  
                let string = `${linhaPedidoVenda.num_salesorder}-${linhaPedidoVenda.productObj.cod.trim()}`;
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
                  let seeKit = await Kit.findBy('cod',childrenHasStep.toUpperCase().trim());
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
                console.log('listadekits oncreate order,', listaDeKitsOnCreateOrder);
          

                console.log('deve r3mover:', ListadeQuemNaotem);
                let lista2 = listaDeKitsOnCreateOrder.filter(function (itm) {
                  return ListadeQuemNaotem.indexOf(itm) == -1;
                });
          
                // console.log('evens',evens);
                console.log('listadekits oncreate order removido,', lista2);
          
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
                  console.log('listaDeKitsOnCreateOrder', listaDeKitsOnCreateOrder);
                  ordemPai = '';
                  for (const speProdsWithKit of lista2) {
                    let objOrdem = {};
                    let produto = await Product.findBy('cod',speProdsWithKit.trim());
                    let step = await stepXprod.findBy('product', produto.id );
                    let kit = await Kit.findBy( 'cod', speProdsWithKit.trim() );
                    let cliente = await Partner.findBy( 'name', pedidoVenda.partner.name );
                    let aux = linhaPedidoVenda['lin_pedido_cliente'];
                    if (aux === null || aux === undefined) {
                      aux = '';
                    }
          
                    //console.log(speProdsWithKit);
          
                    let dataFormatada = moment(linhaPedidoVenda.data_prevista).utc().format(
                      'DD-MM-YYYY'
                    );
                    let dataFixaProd = '31-12-2050';
          
                    objOrdem.product = produto.id;
                    objOrdem.establishments = 1;
                    objOrdem.partner = cliente.id;
                    objOrdem.pedidoCliente = aux;
                    objOrdem.orderFox = pedidoVenda.id;
                    objOrdem.unity = produto.unity;
                    objOrdem.qtde = linhaPedidoVenda.qty === null ? 0 : linhaPedidoVenda.qty;
                    objOrdem.description = produto.description1;
                    objOrdem.dataEntrega = dataFormatada;
                    objOrdem.dataProd = dataFixaProd;
                    objOrdem.dataProdEnd = dataFixaProd;
                    objOrdem.orderProduction = '';
                    objOrdem.status = 'planejada';
                    objOrdem.itemOrderFox = linhaPedidoVenda.sequencia;

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
                          insideKit.qtde = insideKit.qtde * linhaPedidoVenda.qty;
                        }
                      }
                      objOrdem.components = kit.products;
                    }
          
                    // let nativeCall = await sails.sendNativeQuery(
                    //   'SELECT MAX(prioridade) from orderprod',
                    //   []
                    // );

                    const maximum = await OrderProd.query().max('prioridade');

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

                    console.log(objOrdem);

                    objOrdem.components = JSON.stringify(objOrdem.components);
                    objOrdem.etapas = JSON.stringify(objOrdem.etapas);

                    const orderData = await OrderProdService.criarOrdem(objOrdem);
                    
                    // const test  = await axios.post(url_orderprod, objOrdem);

                    if(orderData){

                      if(speProdsWithKit === produtoPai){
                        const upgradeLinha = await LinhaPedido
                        .query()
                        .where('id', linhaPedidoVenda.id)
                        .update({orderprod_id: orderData.id});

                        console.log(upgradeLinha);
                      }
                    }

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
          }
        }

      } catch (error) {
        console.log(error);
      }

      console.log('Encerrando on create orders.');

      return response.status(200).json(listaOfMessages);
    }

    async updateOrdersLin({request,response}) {

      try {
        
      
      let linhas = await LinhaPedido.query().whereNotNull('orderprod_id').fetch();
      
      console.log(linhas);
      for (const iterator of linhas.rows) {
        let seq = iterator.sequencia;
        let id_order = iterator.orderprod_id;

        await OrderProd.query().where({ id: id_order }).update({
          itemOrderFox: seq,
        });
        
      }

      let linhasreturn = await LinhaPedido.query().whereNotNull('orderprod_id').fetch();

      return linhasreturn

    } catch (error) {
      return error   
    }
    }
}

//Funcao para ver se o produto tem Kit
async function seeIfKit(produto, aux) {
    let pool = await sql.connect(`mssql://${user}:${pwd}@${url}/FOX_00001`);
  
    let queryArvore = `SELECT
        UPPER(a.Produto) as 'Produto',
        UPPER(a.Componente) as 'Componente',
        a.Quantidade,
        a.Sequencial,
        a.Data,
        a.[Data de Exclusão],
        p.Grupo
        FROM Árvore as a
        inner join Produtos as p on p."Código" = a.Produto
          WHERE a.Produto = '${produto}'
          ORDER BY a.Produto`;
  
    let resultArvore = await pool.request().query(queryArvore);
  
    if (resultArvore.recordset.length === 0 || resultArvore.recordset[0].Componente.trim() === resultArvore.recordset[0].Produto.trim()) {
      let verifProduct = await Product.findBy('cod', produto.trim());
  
      let query2 = `SELECT UPPER(Código) as 'Código' , Unidade , Linha01 , Linha02, Linha03, Grupo FROM Produtos p WHERE Código = '${produto}';`;
      let resultProduct = await pool.request().query(query2);
      let pResultSet = resultProduct.recordset[0];
      // console.log(verifProduct);
      if (verifProduct != null || verifProduct != undefined) {
        await Product.query()
        .where('id', verifProduct.id)
        .update({
            unity: pResultSet.Unidade,
            category: pResultSet.Grupo,
            description1: pResultSet.Linha01,
            description2: pResultSet.Linha02,
            description3: pResultSet.Linha03, });
      } else {
        console.log('entrou no else 573', pResultSet);
        //Caso o produto nao tenha Kit, ele deve ser criado como produto no Iconnect.
        //Aqui e necessario criar uma query SPE para trazer campos como unidade e descricoes no banco, pois na query principal nao tem estas informacoes deste Produto.
        let objCreate = {
          cod: '',
          category: '',
          unity: '',
          description1: '',
          description2: '',
        };
        if (pResultSet !== null && pResultSet !== undefined) {
          const id = null;
          objCreate.cod = pResultSet.Código;
          objCreate.category = id;
          objCreate.unity = pResultSet.Unidade;
          objCreate.description1 = pResultSet.Linha01;
          objCreate.description2 = pResultSet.Linha02;
  
          await Product.create(objCreate);
        }
      }
    } else {
      console.log('aux:', aux);
      
      let found;
      found = resultArvore.recordset.find((o) => o.Produto === produto);
      if(found.Grupo === 22){
      }else{
        listaGlobal.push(produto);
      }
  
      let count;
      if (aux === 'dadosBasicos') {
        count = listaGlobal.find((index) => index === produto);
      } else {
        if (aux === 'criarOrdem') {
          count = listaDeKitsOnCreateOrder.find((index) => index === produto);
        }
      }
  
      // listaGlobal.push(produto);
  
      if (count) {
      } else {
        if (aux === 'dadosBasicos') {
         
          let found;
          found = resultArvore.recordset.find((o) => o.Produto === produto);
  
          if(found.Grupo === 22){
          }else{
            listaGlobal.push(produto);
          }
        } else {
          if (aux == 'criarOrdem') {
            listaDeKitsOnCreateOrder.push(produto);
          }
        }
  
        for (const arvore2 of resultArvore.recordset) {
          function timeOutPromise() {
            return new Promise(function (resolve) {
              if (aux === 'dadosBasicos') {
                resolve(seeIfKit(arvore2.Componente, 'dadosBasicos'));
              } else {
                if (aux === 'criarOrdem') {
                  resolve(seeIfKit(arvore2.Componente, 'criarOrdem'));
                }
              }
            });
          }
          function doSomething() {
            return timeOutPromise();
          }
  
          await doSomething();
        }
      }
    }
  }
  
  //Funcao para criar Kit
  async function creatingKit(codKit) {
    let ifProductExist = await Product.findBy( 'cod', codKit.trim());
  
    if (ifProductExist != null || ifProductExist != undefined) {
      let objKitCreate = {
        cod: '',
        product: '',
        name: '',
        qtdebase: '',
        unity: '',
        products: [],
      };
  
      objKitCreate.cod = ifProductExist.cod;
      objKitCreate.product = ifProductExist.id;
      objKitCreate.name = ifProductExist.description1;
      objKitCreate.qtdebase = 1;
      objKitCreate.unity = ifProductExist.unity;
  
      let pool = await sql.connect(`mssql://${user}:${pwd}@${url}/FOX_00001`);
  
      let queryArvore = `SELECT
              UPPER(Produto) as 'Produto',
              UPPER(Componente) as 'Componente' ,
              ITM.Linha01,
              ITM.Unidade,
              Quantidade,
              Sequencial,
              Data,
              [Data de Exclusão]
              FROM Árvore arv INNER JOIN Produtos ITM on arv.Componente = ITM.Código
              WHERE Produto = '${ifProductExist.cod}'
              ORDER BY Sequencial`;
  
      let resultArvore = await pool.request().query(queryArvore);
  
      let listaArrays = [];
  
      let array = resultArvore.recordset;
  
      let prioridade = 0;
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
  
        if (index === 0) {
          prioridade = index + 1;
        } else {
          prioridade = prioridade + 1;
        }
  
        let objJson = {
          key: index,
          sequencia: element.Sequencial,
          prioridade: prioridade,
          produto: element.Componente,
          desc: element.Linha01,
          qtde: element.Quantidade,
          unidade: element.Unidade,
        };
  
        listaArrays.push(objJson);
      }
      
      var myJsonString = JSON.stringify(listaArrays);
      objKitCreate.products = myJsonString;
  
      let KitCriado;
  
      let kitFact = await Kit.findBy( 'cod', codKit.trim());
  
      if (kitFact != null || kitFact != undefined) {
        KitCriado = await Kit.query().returning('cod').where('id', kitFact.id).update(objKitCreate);
        listaMessagesDataB.push(`Kit: "${KitCriado[0]}" ATUALIZADO !`);
      } else {
        KitCriado = await Kit.create(objKitCreate);
        listaMessagesDataB.push(`Kit: "${KitCriado.cod}" CRIADO !`);
      }
  
      if (KitCriado) {
        return KitCriado;
      } else {
        return 'erro';
      }
    } else {
    }
  }
  

module.exports = FoxController

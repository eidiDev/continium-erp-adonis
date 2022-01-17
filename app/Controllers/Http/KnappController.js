'use strict'
const { query } = require('@adonisjs/lucid/src/Lucid/Model');
let moment = require('moment');
const User = use('App/Models/User');
const knapplog = use('App/Models/LogKnapp');
const PedidoVenda = use('App/Models/SalesOrder');
const Lin_Pd_Venda = use('App/Models/LinSalesOrder');
const Partner = use('App/Models/Partner');

let errors = {
    errorKey: "Não foi possivel achar a chave do pedido de venda, coloque uma chave do pedido para prosseguir.",
    errorPartner: "Não foi possivel achar o cliente KNAPP na base de dados.",
    errorCreate: "Não foi possivel criar o Header do Pedido de venda, revise os padrões de envio na documentação.",
    errorCreateLines : {
        message: "Não foi possivel criar as linhas do Pedido de venda, revise os padrões de envio na documentação.",
        errorObj : ""
    } ,
    errorToken : "Usuário não permitido, tente novamente.",
    errorUpdateLines: "Não foi possivel atualizar as linhas do Pedido de venda, revise os padrões de envio na documentação",
    errorNotFoundArray: "Não foi possivel encontrar as linhas do pedido no corpo da requisição, revise os padrões de envio na documentação"
}

errors.errorObj = ""

class KnappController {


    async EnviarInfoKnapp({ request, auth, response }) {
        const { email, password } = request.only(['email', 'password']);
        const { token } = await auth.attempt(email, password);

        var user = {};
        if (token) {
            user = await User.findBy('email', email);
            if (user) {
                const dataJsonKnapp = request.all();
                delete dataJsonKnapp.email;
                delete dataJsonKnapp.password;

                try {
                    const log = await knapplog.create({
                        pedido_venda_knapp: dataJsonKnapp
                    })

                    //1 analisar se este pedido de venda ja existe
                    let procurarPedidoVenda
                    if (dataJsonKnapp.num_salesorder) {
                        procurarPedidoVenda = await PedidoVenda.findBy('id', dataJsonKnapp.num_salesorder);
                    } else {
                        throw errors.errorKey
                    }

                    if(!dataJsonKnapp.linhasPedidoVenda){
                        throw errors.errorNotFoundArray
                    }

                    if (procurarPedidoVenda === null) {
                        // procurando id do cliente KNAPP
                        let clienteKnapp
                        clienteKnapp = await Partner.findBy('name', 'KNAPP');
                        
                        if (!clienteKnapp) {
                            throw errors.errorPartner
                        }

                        //Criando pedido venda e linhas com as informações mandadas por request
                        let objtocreatePedidoVenda = {
                            "id": dataJsonKnapp.num_salesorder,
                            "status": "pendente",
                            "is_integracao": true,
                            "partner_id": clienteKnapp.id,
                            "orddat": moment(),
                            "numnfe": dataJsonKnapp.numnfe, // String
                            "serie": dataJsonKnapp.serie,// String
                            "obs": dataJsonKnapp.obs,//String
                            "vl_total":dataJsonKnapp.vl_total, //Decimal
                            "vl_total_frete": dataJsonKnapp.vl_total_frete,//Decimal
                            "vl_total_merc": dataJsonKnapp.vl_total_merc,//Decimal
                            "vl_total_outros": dataJsonKnapp.vl_total_outros, //Decimal
                            "vl_total_desc": dataJsonKnapp.vl_total_desc,//Decimal
                            "pedido_cliente": dataJsonKnapp.pedido_cliente, //String
                            "pedido_fox": dataJsonKnapp.pedido_fox,//Strng
                            "mod_frete": dataJsonKnapp.mod_frete,//String 
                            "tipo_registro": dataJsonKnapp.tipo_registro,//Enum, pode mandar como string("fatura" ou "nfs-e")
                            "peso_liquido":dataJsonKnapp.peso_liquido, //Decimal
                            "peso_bruto":dataJsonKnapp.peso_bruto, //Decimal
                            "nr_volumes": dataJsonKnapp.nr_volumes//Inteiro
                        }

                        let criarPedidovenda
                        criarPedidovenda = await PedidoVenda.create(objtocreatePedidoVenda);

                        if (criarPedidovenda) {
                            //criar linhas do pedido de venda
                            let dataReturnPDCreate;
                            try {
                                for (const iterator of dataJsonKnapp.linhasPedidoVenda) {
                                    //validacao de datas
                                    let myDate
                                    if (iterator.DataEntr instanceof Date) {
                                        myDate = iterator.DataEntr
                                    } else {
                                        if (typeof iterator.DataEntr === "string") {
                                            myDate = moment(iterator.DataEntr, 'DD-MM-YYYY').toDate();
                                        }
                                    }

                                    let objtocreateLinha = {
                                        num_salesorder: criarPedidovenda.id,
                                        lin_pedido_cliente: iterator.Pedido,
                                        produto_cliente: iterator.CodProdutoCliente,
                                        tipo_produto: 'produto',
                                        qty: iterator.Qtde,
                                        obs: iterator.Observacoes,
                                        data_entrega: myDate,
                                        data_prevista: myDate,
                                        sequencia: iterator.Seq,
                                        descricao_fornecedor:iterator.descricao_fornecedor, //String
                                        descricao_produto:iterator.descricao_produto, //String
                                        valor_unitario: iterator.valor_unitario, //Decimal
                                        valor_prod: iterator.valor_prod,//Decimal
                                        porcentagem_ipi:iterator.porcentagem_ipi, //Decimal
                                        valor_ipi: iterator.valor_ipi,//Decimal
                                        CodProjeto: iterator.CodProjeto,
                                        DescProjeto: iterator.DescProjeto,
                                        EndEstoque: iterator.EndEstoque,
                                        DescProdutoCliente: iterator.DescProdutoCliente,
                                        CondPagamento: iterator.CondPagamento,
                                        TipoFrete: iterator.TipoFrete,
                                        ClassFiscal: iterator.ClassFiscal,
                                        DesForn: iterator.DesForn,
                                        Solicitante: iterator.Solicitante
                                    }
                                    console.log(objtocreateLinha);
                                    await Lin_Pd_Venda.create(objtocreateLinha);
                                }

                                dataReturnPDCreate = await PedidoVenda.query().where('id', criarPedidovenda.id).with('linhas').fetch();
                                return response.status(200).json({
                                    message: 'Pedido de venda e linhas criadas',
                                    data: dataReturnPDCreate
                                });

                            } catch (error) {
                                if(criarPedidovenda){
                                    await criarPedidovenda.delete()
                                }
                                errors.errorCreateLines.errorObj = error
                                throw errors.errorCreateLines
                            }
                        } else {
                            throw errors.errorCreate
                        }
                    } else {
                        //atualizar linhas do pedido de venda
                        //caso nao exista uma nova linha adicionada a este pedido de venda, ele ira criar
                        let listadareq = dataJsonKnapp.linhasPedidoVenda;
                        let dataReturnUpdate;

                        try {
                            for (const iterator of listadareq) {
                                let acharlin = await Lin_Pd_Venda.query()
                                    .where({ sequencia: iterator.Seq, num_salesorder: procurarPedidoVenda.id }).fetch();

                                console.log(acharlin);
                                if (acharlin === null) {
                                    let objtocreateLinha = {
                                        "num_salesorder": criarPedidovenda.id,
                                        "lin_pedido_cliente": iterator.Pedido,
                                        "produto_cliente": iterator.CodProdutoCliente,
                                        "tipo_produto": 'produto',
                                        "qty": iterator.Qtde,
                                        "obs": iterator.Observacoes,
                                        "data_entrega": myDate,
                                        "data_prevista": myDate,
                                        "sequencia": iterator.Seq,
                                        "descricao_fornecedor":iterator.descricao_fornecedor, //String
                                        "descricao_produto":iterator.descricao_produto, //String
                                        "valor_unitario": iterator.valor_unitario, //Decimal
                                        "valor_prod": iterator.valor_prod,//Decimal
                                        "porcentagem_ipi":iterator.porcentagem_ipi, //Decimal
                                        "valor_ipi": iterator.valor_ipi,//Decimal,
                                        "CodProjeto": iterator.CodProjeto,
                                        "DescProjeto": iterator.DescProjeto,
                                        "EndEstoque": iterator.EndEstoque,
                                        "DescProdutoCliente": iterator.DescProdutoCliente,
                                        "CondPagamento": iterator.CondPagamento,
                                        "TipoFrete": iterator.TipoFrete,
                                        "ClassFiscal": iterator.ClassFiscal,
                                        "DesForn": iterator.DesForn,
                                        "Solicitante": iterator.Solicitante
                                    }
                                    dataReturnUpdate = await Lin_Pd_Venda.create(objtocreateLinha);
                                }
                            }

                            dataReturnUpdate = await PedidoVenda.query().where('id', procurarPedidoVenda.id).with('linhas').fetch();
                            return response.status(200).json({ message: 'Pedido de venda atualizado com novas linhas !',
                                data: dataReturnUpdate });
                        } catch (error) {
                            throw errors.errorUpdateLines
                        }
                    }
                } catch (error) {
                    return response.status(400).json({
                        error
                    });
                }
            }
        }else{
            return response.esponse.status(400).json(
                {error: errors.errorToken}
            )
        }


        //return response.status(200).json({ token, user });
    }
}

module.exports = KnappController

'use strict'
//const moment = require('moment-timezone');
//const { DateTime } = require("luxon");
const sql = require('mssql');
const user = 'ICONNECT';
const pwd = 'Cora@2018';
const url = '201.22.57.246';

const Database = use('Database');
const ConsultaStock = use("App/Models/ConsultaStock");
const LogsConsulta = use("App/Models/LogsConsulta");


class EstoqueFoxController {
    async buscarProdutoFoxEstoque({ request, response }) {

        const { codProduto, username } = request.all();

        try {
            let pool

            try {
                pool = await sql.connect(`mssql://${user}:${pwd}@${url}/FOX_00001`);
            } catch (error) {
                return response.status(400).json("Não foi possivel conectar a base de dados do FOX");
            }

            let queryArvore;

            if (username) {
                let findUser = await ConsultaStock.findBy('username', username);
                let categs = findUser.groups_grants.join();

                if (findUser.qty_show === 'limitado') {
                    let query = `SELECT count(*) FROM logs_consultas where (created_at::date = current_date) and (num_consulta_stock = ${findUser.id});`
                    let nativeCall = await Database.raw(query)
                    let linhas = nativeCall.rows

                    let countVar = linhas[0].count;
                    if (parseInt(countVar) >= findUser.limiteAcesso) {
                        return response.status(400).json("Limite de acesso por dia atingido, Tente novamente outro dia")
                    }
                }

                if (findUser) {
                    if (findUser.showPrice) {
                        queryArvore = `select e.*,
                    idtdp.Tabela,
                    idtdp.[Valor de Venda] as valordevenda,
                    ITM.Código,ITM.Linha01 ,
                    ITM.Linha02 , 
                    ITM.Linha03, 
                    ITM.Unidade 
                    from ESTLOCAL e 
                    inner join Produtos ITM on ITM.Código = e.CODPRO
                    inner join [Itens da Tabela de Preços] idtdp on idtdp.Produto = e.CODPRO 
                    WHERE (e.CODPRO = '${codProduto}') 
                    and (ITM.Grupo in (${categs}))
                    and (idtdp.Tabela = 500 or idtdp.Tabela = 74)`;
                    } else {
                        queryArvore = `select e.*,
                idtdp.Tabela,
                ITM.Código,ITM.Linha01 ,
                ITM.Linha02 , 
                ITM.Linha03, 
                ITM.Unidade 
                from ESTLOCAL e 
                inner join Produtos ITM on ITM.Código = e.CODPRO
                inner join [Itens da Tabela de Preços] idtdp on idtdp.Produto = e.CODPRO 
                WHERE (e.CODPRO = '${codProduto}') 
                and (ITM.Grupo in (${categs}))
                and (idtdp.Tabela = 500 or idtdp.Tabela = 74)`;
                    }
                }

                try {
                    let resultArvore = await pool.request().query(queryArvore);

                    let listaRetorno = resultArvore.recordset
                    let listaRetorno2
                    if (findUser.showPrice) {
                        let queryIPI = `select p.[Código do NCM],
                    n.CodIpi,
                    i.DESIPI 
                    from Produtos p
                    inner join NCM n on p.[Código do NCM] = n.Código 
                    inner join IPICalculo i on i.CODIPI  = n.CodIpi
                    WHERE p.Código = '${codProduto}';`
                        let resultIPI = await pool.request().query(queryIPI);


                        listaRetorno2 = resultIPI.recordset;
                    }
                    // let nz_date_string = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

                    // console.log(nz_date_string);

                    // let bogus = DateTime.utc().setZone("America/Sao_Paulo");
                    // let aux2 = DateTime.fromISO(bogus);

                    const criarLog = await LogsConsulta.create({
                        num_consulta_stock: findUser.id,
                        produto_consultado: codProduto
                    });

                    return response.status(200).json({ query1: listaRetorno, query2: listaRetorno2[0] });
                } catch (error) {
                    console.log(error);
                }


            }

        } catch (error) {
            console.log(error);
            return response.status(400).json({message: "Erro interno tente novamente mais tarde"})
        }
    }


    async buscarCodiceEspeciais({ request, response }) {
        const { codProduto } = request.all();

        console.log(codProduto);
        let query = `SELECT "CodArticolo", descrizione, "CodiceExt"
        FROM cods_especiais where "CodiceExt" = '${codProduto}';`

        try {
            let nativeCall = await Database.raw(query)

            let linhas = nativeCall.rows
            if (linhas.length === 0) {
                return response.status(400)
            } else {
                return response.status(200).json(linhas[0]);
            }
        } catch (error) {
            console.log(error);
        }

    }
}

module.exports = EstoqueFoxController

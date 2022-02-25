module.exports = ({
  dataEntrega,
  dataProd,
  establishment,
  partner,
  product,
  orderFox,
  description,
  orderProduction,
  qtde,
  unity,
  status,
  pedidoCliente,
  prioridade,
  prods,
  tablesteps,
  tableComp,
  emitente,
  itemOrderFox,
}) => {
  return `
    <!doctype html>
    <html>
       <head>
          <meta charset="utf-8">
          <title>PDF Result Template</title>

       </head>

       <style type="text/css">

          .tg  {border-collapse:collapse;border-spacing:0;text-align: center;margin-left:auto; margin-right:auto;}
          .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:12px;
              overflow:hidden;padding:1px 20px;word-break:normal;}
          .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:12px;
              font-weight:normal;overflow:hidden;padding:1px 20px;word-break:normal;}
          .tg .tg-1wig{font-weight:bold;text-align:left;vertical-align:top}
          .tg .tg-c3ow{border-color:black;text-align:center;vertical-align:top}
          .tg .tg-7btt{border-color:black;font-weight:bold;text-align:center;vertical-align:top}
          .tg .tg-fymr{border-color:black;text-align:left;vertical-align:top}

          .tg1  {border-collapse:collapse;border-color:black;border-spacing:0;margin:0px auto;overflow-x:auto;width 5px;}
          .tg1 td{background-color:#fff;border-color:black;border-style:solid;border-width:1px;color:#333;
          font-family:Arial, sans-serif;font-size:9px;overflow:hidden;padding:5px;word-break:normal;}
          .tg1 th{background-color:#f0f0f0;border-color:black;border-style:solid;border-width:1px;color:#333;
          font-family:Arial, sans-serif;font-size:9px;font-weight:normal;overflow:hidden;padding:5px;word-break:normal;}
          .tg1 .tg1-0lax{text-align:left;vertical-align:top;vertical-align: middle;}


          .tg2  {border-collapse:collapse;border-color:black;border-spacing:0;margin:0px auto; overflow-x:auto;width: 5px;}
          .tg2 td{background-color:#fff;border-color:black;border-style:solid;border-width:1px;color:#333;
            font-family:Arial, sans-serif;font-size:9px;overflow:hidden;padding:5px 7px;word-break:normal;}
          .tg2 th{background-color:#f0f0f0;border-color:black;border-style:solid;border-width:1px;color:#333;
            font-family:Arial, sans-serif;font-size:9px;font-weight:normal;overflow:hidden;padding:5px 7px;word-break:normal;}
          .tg2 .tg2-ps66{font-size:9px;text-align:left;vertical-align:middle}

          .tg3  {border-collapse:collapse;border-spacing:0;margin:0px auto;width: 100%;overflow-x:auto;width: 5px;}
          .tg3 td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:9px;
          overflow:hidden;padding:10px 5px;word-break:normal;}
          .tg3 th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:9px;
          font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
          .tg3 .tg3-0lax{text-align:left;vertical-align:top;vertical-align: middle;}


            .tg4  {border-collapse:collapse;border-spacing:0;margin:0px auto;}
            .tg4 td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:10px;
            overflow:hidden;padding:10px 40px;word-break:normal;}
            .tg4 th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:10px;
            font-weight:normal;overflow:hidden;padding:10px 40px;word-break:normal;}
            .tg4 .tg4-0pky{border-color:black;text-align:left;vertical-align:top}
            .tg4 .tg4-0lax{text-align:left;vertical-align:top;vertical-align: middle;}

        </style>
       <body>
         <div>
            <center>
            <table class="tg" style="font-size: 14px;">
                <thead>
                    <tr>
                        <th class="tg-c3ow">
                            </br></br>
                            <img src="https://svgshare.com/i/eU0.svg" style="width:100%; max-width:150px;">
                        </th>
                        <th class="tg-7btt;" style="font-size:20px;">
                            Relatório Ordem de produção
                            <br /><br/>
                            <span style="font-size:14px">
                              Ordem de Produção: ${orderProduction}
                            </span>
                        </th>
                        <th class="tg-7btt" style="text-align:left;">
                            <br/>
                            Pedido de Venda: ${orderFox === null || orderFox === undefined ? '' : orderFox }<br><br>
                            Pedido Cliente: ${pedidoCliente === null || pedidoCliente === undefined ? '' : pedidoCliente }<br><br>
                            Linha pedido Fox: ${itemOrderFox === null || itemOrderFox === undefined ? '' : itemOrderFox } <br/><br/>
                            Cliente: ${partner.name}<br><br>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tg-fymr" colspan="2">
                            <br>
                            <span style="font-weight:bold">
                                Codigo do Produto:
                            </span>
                            <span>
                                ${prods.cod.toUpperCase()}
                            </span>
                            <br><br>
                            <span style="font-weight:bold">
                                Descrição:
                            </span>
                            <span>
                                ${prods.description1.toUpperCase()}
                            </span>
                            <br><br>

                            <span style="font-weight:bold">
                                Razão Social Cliente:
                            </span>
                            <span>
                              ${partner.razao_social}
                            </span>
                            <br><br>
                            
                            <span style="font-weight:bold">
                                Usuário:
                            </span>
                            <span>
                                ${emitente.replace(/"/g, '')}
                            </span>
                            
                            <span style="font-weight:bold;margin-left:50px">
                              Status:
                            </span>
                            <span>
                                ${status.toUpperCase()}
                            </span>
                            <br><br>
                        </td>
                        <td class="tg-fymr" colspan="1">
                            <br/>
                            <span style="font-weight:bold;font-size: 16px">
                                Quantidade:
                            </span>
                            <span style="font-size: 16px">
                                ${qtde}
                            </span>

                            <br><br>
                            <span style="font-weight:bold">
                                Data Liberação:
                            </span>
                            <span>
                                ${dataProd}
                            </span>
                            <br><br>
                            <span style="font-weight:bold">
                                Encerramento Previsto:
                            </span>
                            <span>
                                ${dataEntrega}
                            </span>
                            <br><br>
                            <span style="font-weight:bold">
                                Unidade:
                            </span>
                            <span>
                                ${unity.toUpperCase()}
                            </span>
                            <br><br>
                        </td>
                    <tr>
                    <tr>
                        <td class="tg-1wig" colspan="3">
                            <br><br>
                            <span style="font-weight:bold;font-size:14px">Necessidades: </span>
                            <br><br>

                            <table class="tg1" style="width: 100%;" >
                                <thead>
                                <tr>
                                    <th class="tg1-0lax">Sequencia</th>
                                    <th class="tg1-0lax">Prioridade</th>
                                    <th class="tg1-0lax" style="width:15%; text-align: center">Produto</th>
                                    <th class="tg1-0lax" style="width:55%; text-align: center">Descrição</th>
                                    <th class="tg1-0lax">Qtde</th>
                                    <th class="tg1-0lax">Unidade</th>
                                </tr>
                                </thead>
                                <tbody>
                                ${retornaPartOfTable(tableComp)}
                                </tbody>
                            </table>
                            <br><br>
                        </td>
                    </tr>
                    <tr>
                        <td class="tg-1wig" colspan="3">
                            <br><br>
                            <span style="font-weight:bold;font-size:14px">Etapas do Processo: </span>
                            <br><br>
                            <table class="tg2" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th class="tg2-ps66" style="width:20%;">Etapa</th>
                                        <th class="tg2-ps66">Prioridade</th>
                                        <th class="tg2-ps66">Status</th>
                                        <th class="tg2-ps66">Maquina</th>
                                        <th class="tg2-ps66">Tempo</th>
                                        <th class="tg2-ps66">Programador</th>
                                        <th class="tg2-ps66">Tempo</th>
                                        <th class="tg2-ps66">Operador</th>
                                        <th class="tg2-ps66">Tempo</th>
                                        <th class="tg2-ps66">Montagem</th>
                                        <th class="tg2-ps66">Tempo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${retornaPartOfTableStep(tablesteps)}
                                </tbody>
                            </table>
                            <br>
                            <span style="font-weight:bold">Tempo Total:  </span> <span>${somarTempoEtapas(
                              tablesteps,
                              qtde
                            )}</span>
                            <br><br>
                            <span style="font-weight:bold">Especificação: ${
                              prods.obs === null || prods.obs === undefined ? '' : prods.obs
                            } </span>

                            <br><br>
                        </td>
                    </tr>

                    <tr>
                        <td class="tg-1wig" colspan="3">
                            <br><br>
                            <span style="font-weight:bold;font-size:14px">Controle de produção: </span>
                            <br/><br/>
                            <table class="tg4" style="width:100%">
                                <thead>
                                <tr>
                                    <th class="tg4-0pky"><span style="font-weight:bold">Data </span></th>
                                    <th class="tg4-0lax"><span style="font-weight:bold">Hora Inicial</span></th>
                                    <th class="tg4-0lax"><span style="font-weight:bold">Hora Final</span></th>
                                    <th class="tg4-0lax"><span style="font-weight:bold">Quantidade</span></th>
                                    <th class="tg4-0lax"><span style="font-weight:bold">Visto</span></th>
                                    <th class="tg4-0lax"><span style="font-weight:bold">OBS</span></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                <tr>
                                    <td class="tg4-0lax">Total</td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                    <td class="tg4-0lax"></td>
                                </tr>
                                </tbody>
                            </table>
                            <br><br>
                        </td>
                    </tr>
                </tbody>
            </table>
        </center>
         </div>

       </body>
    </html>
    `;
};

function retornaPartOfTable(tableComp) {
  var string = '';
  tableComp.forEach((element) => {
    string += `<tr>
                <td class="tg1-0lax" style="text-align:center">${element.sequencia}</td>
                <td class="tg1-0lax" style="text-align:center">${element.prioridade}</td>
                <td class="tg1-0lax" style="vertical-align: middle;">${element.produto}</td>
                <td class="tg1-0lax">${element.desc}</td>
                <td class="tg1-0lax" style="text-align:center">${parseFloat(element.qtde).toFixed(5)}</td>
                <td class="tg1-0lax" style="text-align:center">${element.unidade}</td>
            </tr>`;
  });
  return string;
}
function somarTempoEtapas(tablesteps, qtde) {
  var auxsomaResultado = 0;
  var somaDosTemposDasMaq = 0;
  var somaDosTemposMTG = 0;
  for (const iterator of tablesteps) {
    somaDosTemposDasMaq += parseInt(iterator.tempoMaquina);
    somaDosTemposMTG += parseInt(iterator.tempoMontagem);
  }

  var maqSomaXqtde = somaDosTemposDasMaq * qtde;
  var mtgSomaXqtde = somaDosTemposMTG * qtde;

  auxsomaResultado = maqSomaXqtde + mtgSomaXqtde;

  return auxsomaResultado;
}

function retornaPartOfTableStep(tablesteps) {
  var string = '';
  tablesteps.forEach((element) => {
    console.log(element);
    string += `
        <tr>
            <td class="tg2-ps66">${element.etapas.toString().replace('null', '')}</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.prioridadeEtapa === null || element.prioridadeEtapa === undefined ? '' : element.prioridadeEtapa
            }</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.statusEtapa.charAt(0).toUpperCase() +
              element.statusEtapa.slice(1)
            }</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.maquina
            }</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.tempoMaquina
            }</td>
            <td class="tg2-ps66" >${element.programador}</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.tempoProgramador
            }</td>
            <td class="tg2-ps66" >${element.operador}</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.tempoOperador
            }</td>
            <td class="tg2-ps66">${element.montagem}</td>
            <td class="tg2-ps66" style="text-align:center">${
              element.tempoMontagem
            }</td>
        </tr>
         `;
  });
  return string;
}

// ${tableComp.forEach(element => {
//     return `
//     `
// })}
//<img src="https://rodavigo.net/datos/logos-marcas-png/th_pneumax.png" style="width:100%; max-width:200px;" ></img>


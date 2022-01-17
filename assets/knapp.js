module.exports = ({
    dataPrevista,
    idPd,
    seq
}) => {
    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.senior.com.br">
<soapenv:Header/>
<soapenv:Body>
<ser:GravarOrdensCompra_4>
<user>pneumax_webservice</user>
<password>xeJLvkg5IrkY</password>
<encryption>0</encryption>
<parameters>
<!--Zero or more repetitions:-->
<dadosGerais>
<!--Zero or more repetitions:-->
<codEmp>1</codEmp> 
<!--Optional:-->
<codFil>1</codFil> 
<!--Optional:-->
<numOcp>${idPd}</numOcp> 
<!--Zero or more repetitions:-->
<!--Optional:-->
<produtos>
<!--Zero or more repetitions:-->
<!--Optional:-->
<datEnt>${dataPrevista}</datEnt> 
<!--Zero or more repetitions:-->
<!--Optional:-->
<seqIpo>${seq}</seqIpo> 
</produtos>
<!--Optional:-->
</dadosGerais>
<identificadorSistema>PNE</identificadorSistema>  
<!--Optional:-->
<tipoProcessamento>2</tipoProcessamento>
</parameters>
</ser:GravarOrdensCompra_4>
</soapenv:Body>
</soapenv:Envelope>`
}

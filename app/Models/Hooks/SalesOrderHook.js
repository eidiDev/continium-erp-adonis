'use strict'
const modelLinSalesOrder = use("App/Models/LinSalesOrder");
const modelSalesOrder = use("App/Models/SalesOrder");
const SalesOrderHook = exports = module.exports = {}


SalesOrderHook.verifStatus = async (modelInstance) => {
    let varr = modelInstance;
    let salesObj = modelSalesOrder.query().where('id',varr.num_salesorder);

    if(salesObj.status != 'confirmada' || salesObj.status !== 'concluida'){
        const listLins = await modelLinSalesOrder.query().where('num_salesorder', varr.num_salesorder).returning('*').fetch();
        let lista = listLins.toJSON();
    
        const find = lista.find(sles => sles.is_validate === false || sles.is_validate === null);
        try {
            if(find === undefined){
                await modelSalesOrder.query().where('id',varr.num_salesorder).update({status: 'confirmada'});
            }    
        } catch (error) {
            console.log(error);
        }
    }

    
}

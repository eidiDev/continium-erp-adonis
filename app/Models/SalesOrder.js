'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const ScaffoldModel = use("ScaffoldModel");
const SalesOrderFilter = use('App/ModelFilters/SalesOrderFilter')
class SalesOrder extends ScaffoldModel  {

    linhas() {
        return this.hasMany('App/Models/LinSalesOrder','id','num_salesorder')
    }

    partner () {
        return this.belongsTo('App/Models/Partner', 'partner_id', 'id')
    }

}

module.exports = SalesOrder

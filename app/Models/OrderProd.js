'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");
const Database = use('Database');

class OrderProd extends ScaffoldModel {
    static boot(){
        super.boot()
        this.addHook('afterUpdate', 'OrderProdHook.updateTimeAndCusto')
    }
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'orderprod'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }

    static get with() {
        return ['productObj', 'partnerObj', 'establishmentsObj', 'apontamentos','tempoEcustos', 'maquinas']
      }

    productObj () {
        return this.belongsTo('App/Models/Product', 'product', 'id')
    }

    partnerObj(){
        return this.belongsTo('App/Models/Partner', 'partner', 'id')
    }

    establishmentsObj(){
        return this.belongsTo('App/Models/Establishment', 'establishments', 'id')
    }

    apontamentos() {
        return this.hasMany('App/Models/NoteProd', 'id', 'orderProd')
    }

    tempoEcustos() {
        return this.hasMany('App/Models/Timeandcusto', 'id', 'orderProd')
    }

    maquinas () {
        return this.hasMany('App/Models/OrderProdMaquina', 'id', 'orderProd')
    }

}

module.exports = OrderProd

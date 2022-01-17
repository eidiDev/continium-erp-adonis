'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");

class OrderProdMaquina extends ScaffoldModel {
    static get primaryKey() {
        return 'id'
    }

    static get table() {
        return 'orderprodmaquina'
    }

    static get createdAtColumn() {
        return 'createdAt'
    }

    static get updatedAtColumn() {
        return 'updatedAt'
    }

    static get with () {
        return ['orderProdObj']
    }

    orderProdObj() {
        return this.belongsTo('App/Models/OrderProd', 'orderProd', 'id')
    }
}

module.exports = OrderProdMaquina

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const ScaffoldModel = use("ScaffoldModel");
class NoteProd extends ScaffoldModel {
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'noteprod'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }

    orderProdObj () {
        return this.belongsTo('App/Models/OrderProd', 'orderprod', 'id')
    }

    etapaObj () {
        return this.belongsTo('App/Models/MachineLabor', 'etapa', 'id')
    }

    colaboradorObj () {
        return this.belongsTo('App/Models/MachineLabor', 'etapa', 'id')
    }
}

module.exports = NoteProd

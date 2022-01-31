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

    static get with(){
        return ['orderProdObj', 'etapaObj', 'colaboradorObj']
    }

    orderProdObj () {
        return this.belongsTo('App/Models/OrderProd', 'orderProd', 'id')
    }

    etapaObj () {
        return this.belongsTo('App/Models/MachineLabor', 'etapa', 'id')
    }

    colaboradorObj () {
        return this.belongsTo('App/Models/MachineLabor', 'colaborador', 'id')
    }
}

module.exports = NoteProd

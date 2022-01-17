'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");


class Kit extends ScaffoldModel {
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'kit'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }

    static get with () {
        return ['productObj']
    }

    productObj () {
        return this.belongsTo('App/Models/Product', 'product', 'id')
    }
}

module.exports = Kit

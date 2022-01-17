'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");


class TaxaHora extends ScaffoldModel {
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'taxahora'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }
}

module.exports = TaxaHora

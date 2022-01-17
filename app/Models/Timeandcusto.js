'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Timeandcusto extends Model {
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'timeandcusto'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }
}

module.exports = Timeandcusto

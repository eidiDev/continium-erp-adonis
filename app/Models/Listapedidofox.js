'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Listapedidofox extends Model {
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'listapedidofox'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }
}

module.exports = Listapedidofox

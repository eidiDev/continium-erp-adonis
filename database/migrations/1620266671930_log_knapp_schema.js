'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LogKnappSchema extends Schema {
  up () {
    this.create('log_knapps', (table) => {
      table.increments()
      table.json('pedido_venda_knapp')
      table.timestamps()
    })
  }

  down () {
    this.drop('log_knapps')
  }
}

module.exports = LogKnappSchema

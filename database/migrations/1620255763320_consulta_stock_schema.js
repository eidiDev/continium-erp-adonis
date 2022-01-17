'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConsultaStockSchema extends Schema {
  up () {
    this.create('consulta_stocks', (table) => {
      table.increments()
      table.timestamps()
      table.string('nome')
      table.string('sobrenome')
      table.string('username')
      table.string('senha')
      table.boolean('ativo')
      table.boolean('showPrice')
      table.json('groups_grants')
      table.enu('qty_show', ['ilimitado', 'limitado'])
      table.integer('limiteAcesso')

    })
  }

  down () {
    this.drop('consulta_stocks')
  }
}

module.exports = ConsultaStockSchema

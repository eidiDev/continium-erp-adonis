'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LogsConsultasSchema extends Schema {
  up () {
    this.create('logs_consultas', (table) => {
      table.increments()
      table.integer('num_consulta_stock')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('consulta_stocks')
      .onDelete('cascade')
      table.string('produto_consultado')
      table.timestamps()
    })
  }

  down () {
    this.drop('logs_consultas')
  }
}

module.exports = LogsConsultasSchema

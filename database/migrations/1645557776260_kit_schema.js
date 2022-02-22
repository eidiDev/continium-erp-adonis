'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KitSchema extends Schema {
  up () {
    this.table('kit', (table) => {
      // alter table
      table
      .integer('product')
      .alter()
      .references('id')
      .inTable('product')
      .onDelete('CASCADE')
    })
  }

  down () {
    this.table('kit', (table) => {
      // reverse alternations
    })
  }
}

module.exports = KitSchema

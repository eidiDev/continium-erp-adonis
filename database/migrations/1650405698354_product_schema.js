'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductSchema extends Schema {
  up () {
    this.table('product', (table) => {
      // alter table
      table.boolean('is_active').defaultTo(true)
    })
  }

  down () {
    this.table('product', (table) => {
      // reverse alternations
      table.dropColumn('is_active');
    })
  }
}

module.exports = ProductSchema

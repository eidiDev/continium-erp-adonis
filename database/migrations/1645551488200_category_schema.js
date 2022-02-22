'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CategorySchema extends Schema {
  up () {
    this.table('category', (table) => {
      // alter table
      table.increments('id')
    })
  }

  down () {
    this.table('category', (table) => {
      // reverse alternations
    })
  }
}

module.exports = CategorySchema

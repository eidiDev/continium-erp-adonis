'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NoteProdSchema extends Schema {
  up () {
    this.table('noteprod', (table) => {
      // alter table
      table.string('motivo_retrabalho');
    })
  }

  down () {
    this.table('noteprod', (table) => {
      // reverse alternations
      table.dropColumn('motivo_retrabalho');
    })
  }
}

module.exports = NoteProdSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LinSalesOrderSchema extends Schema {
  up () {
    this.table('lin_sales_orders', (table) => {
      // alter table
    })
  }

  down () {
    this.table('lin_sales_orders', (table) => {
      // reverse alternations
    })
  }
}

module.exports = LinSalesOrderSchema

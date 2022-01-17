'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FollowUpSchema extends Schema {
  up () {
    this.create('follow_ups', (table) => {
      table.increments()

      
      table.integer('num_lin_salesorder')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('lin_sales_orders')
      .onDelete('cascade')


      table.integer('num_orderprod')
      .unsigned()
      .references('id')
      .inTable('orderprod')
      .nullable()
      .onDelete('set null')
      


      table.json('observations')

      
      table.timestamps()
    })
  }

  down () {
    this.drop('follow_ups')
  }
}

module.exports = FollowUpSchema

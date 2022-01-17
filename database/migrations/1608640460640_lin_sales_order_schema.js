'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LinSalesOrderSchema extends Schema {
  up () {
    this.create('lin_sales_orders', (table) => {
      table.increments()

      table.integer('num_salesorder')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('sales_orders')
      .onDelete('cascade')
      table.string('lin_pedido_cliente')
      table.string('lin_pedido_fox')

      table.integer('product_id')
      .unsigned()
      .references('id')
      .inTable('product')

      table.string('produto_cliente')
      table.enu('tipo_produto', ['produto', 'servico'])
      table.string('unidade')
      table.string('cfop')
      table.decimal('qty')
      table.date('data_entrega')
      table.date('data_prevista')
      table.string('obs')
      table.decimal('qty_produzida')
      table.boolean('is_validate')

      table.integer('orderprod_id')
      .unsigned()
      .references('id')
      .inTable('orderprod')
      .onDelete('set null')
      table.timestamps()
    })
  }

  down () {
    this.drop('lin_sales_orders')
  }
}

module.exports = LinSalesOrderSchema

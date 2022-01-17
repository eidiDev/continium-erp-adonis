'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SalesOrderSchema extends Schema {
  up () {
    this.create('sales_orders', (table) => {
      table.increments()
      table.integer('partner_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('partner')
      table.date('orddat')
      table.enu('status', ['pendente', 'confirmada', 'concluida'])
      table.string('numnfe')
      table.string('serie')
      table.string('obs')
      table.decimal('vl_total')
      table.decimal('vl_total_frete')
      table.decimal('vl_total_merc')
      table.decimal('vl_total_outros')
      table.decimal('vl_total_desc')
      table.boolean('is_integracao')
      table.string('pedido_cliente')
      table.string('pedido_fox')
      table.string('mod_frete')
      table.enu('tipo_registro', ['fatura', 'nfs-e'])
      table.decimal('peso_liquido')
      table.decimal('peso_bruto')
      table.integer('nr_volumes')
      table.json('endereco_entrega')
      table.json('endereco_cobranca')
      table.timestamps()
    })
  }

  down () {
    this.drop('sales_orders')
  }
}

module.exports = SalesOrderSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LinSalesOrderSchema extends Schema {
  up () {
    this.table('lin_sales_orders', (table) => {
      // alter table
      table.string('descricao_fornecedor');
      table.string('descricao_produto');
      table.decimal('valor_unitario');
      table.decimal('valor_prod');
      table.decimal('porcentagem_ipi');
      table.decimal('valor_ipi');
    })
  }

  down () {
    this.table('lin_sales_orders', (table) => {
      // reverse alternations
      table.dropColumn('descricao_fornecedor');
      table.dropColumn('descricao_produto');
      table.dropColumn('valor_unitario');
      table.dropColumn('valor_prod');
      table.dropColumn('porcentagem_ipi');
      table.dropColumn('valor_ipi');
    })
  }
}

module.exports = LinSalesOrderSchema

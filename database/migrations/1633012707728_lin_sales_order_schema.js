'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LinSalesOrderSchema extends Schema {
  up () {
    this.table('lin_sales_orders', (table) => {
      // alter table
      table.string('DescProdutoCliente');
      table.string('CondPagamento');
      table.string('TipoFrete');
      table.string('ClassFiscal');
      table.string('DesForn');
      
    })
  }

  down () {
    this.table('lin_sales_orders', (table) => {
      // reverse alternations
      table.dropColumn('DescProdutoCliente');
      table.dropColumn('CondPagamento');
      table.dropColumn('TipoFrete');
      table.dropColumn('ClassFiscal');
      table.dropColumn('DesForn');
      
    })
  }
}

module.exports = LinSalesOrderSchema

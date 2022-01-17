'use strict';

const Database = use('Database');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const SalesOrderFilter = use('App/ModelFilters/SalesOrderFilter');

class ScaffoldModel extends Model {
  static async getTables() {
    const { rows = [] } = await Database.raw(
      `select * from information_schema.tables where table_schema='public';`
    );
    const tables = rows.filter((row) =>
      row.table_name.indexOf('adonis_schema')
    );
    this.tables = tables.map((table) => table.table_name);
    return this;
  }
  static async getColumns() {
    const { rows = [] } = await Database.raw(
      `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = '${this.table}'`
    );
    this.dataTypes = rows;
    try {
      // this.accessible_attributes = this.visible.map((attribute) => {
      //   const column = rows.find((row) => row.column_name === attribute);
      //   return {
      //     name: column.column_name,
      //   };
      // });
      this.accessible_attributes = this.dataTypes.map((column) => {
        return column.column_name;
      });
      console.log(this);
      return this;
    } catch (error) {
      console.log(error);
    }
  }

  static async getDataTypes() {
    const { rows = [] } = await Database.raw(
      `SELECT COLUMN_NAME, UDT_NAME FROM information_schema.columns WHERE table_name = '${this.table}'`
    );
    this.dataTypes = rows;
    try {
      // this.accessible_attributes = this.visible.map((attribute) => {
      //   const column = rows.find((row) => row.column_name === attribute);
      //   return {
      //     name: column.column_name,
      //     type: column.data_type,
      //   };
      // });
      this.columns_data_types = this.dataTypes.map((column) => {
        return {
          column_name: column.column_name,
          type: column.udt_name,
        };
      });
      // console.log(this);
      return this;
    } catch (error) {
      console.log(error);
    }
  }

  static boot() {
    super.boot();
    this.addTrait('@provider:Filterable', SalesOrderFilter);
  }
}

module.exports = ScaffoldModel;

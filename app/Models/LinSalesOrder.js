'use strict'

const { HasOne } = require('@adonisjs/lucid/src/Lucid/Relations');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");
const Database = use('Database');

class LinSalesOrder extends Model {
    static boot () {
        super.boot()
        this.addHook('afterUpdate', 'SalesOrderHook.verifStatus')
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
    

    orderprod(){
       return this.belongsTo('App/Models/OrderProd', 'orderprod_id', 'id')
    }

    productObj () {
        return this.belongsTo('App/Models/Product', 'product_id', 'id')
    }

    salesOrder(){
        return this.belongsTo('App/Models/SalesOrder', 'num_salesorder', 'id')
    }
}

module.exports = LinSalesOrder

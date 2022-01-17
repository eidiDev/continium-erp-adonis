'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");
const Database = use('Database');

class OrderProd extends Model {
    static boot(){
        super.boot()
        this.addHook('afterUpdate', 'OrderProdHook.updateTimeAndCusto')
    }
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'orderprod'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }

    productObj () {
        return this.belongsTo('App/Models/Product', 'product', 'id')
    }

    partnerObj(){
        return this.belongsTo('App/Models/Partner', 'partner', 'id')
    }

    establishmentsObj(){
        return this.belongsTo('App/Models/Establishment', 'establishments', 'id')
    }

    apontamentos() {
        return this.hasMany('App/Models/NoteProd', 'noteProd', 'id')
    }

    tempoEcustos() {
        return this.hasMany('App/Models/Timeandcusto', 'timeandcusto', 'id')
    }

    maquinas () {
        return this.hasMany('App/Models/OrderProdMaquina', 'id', 'orderProd')
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
}

module.exports = OrderProd

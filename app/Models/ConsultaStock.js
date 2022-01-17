'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");

class ConsultaStock extends ScaffoldModel {
    
    static get with(){
        return ['logs']
    }

    logs() {
        return this.hasMany('App/Models/LogsConsulta', 'id', 'num_consulta_stock')
    }
}

module.exports = ConsultaStock

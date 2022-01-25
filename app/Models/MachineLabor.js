'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");


class MachineLabor extends ScaffoldModel {

  static get primaryKey() {
    return 'id'
  }

  static get table() {
    return 'machinelabor'
  }

  static get createdAtColumn() {
    return 'createdAt'
  }

  static get updatedAtColumn() {
    return 'updatedAt'
  }

  static get with(){
    return ['rateTimeRelations']
}


  rateTimeRelations() {
    return this.belongsTo('App/Models/TaxaHora', 'rateTimeRelation', 'id')
  }

  dashboards() {
    return this.belongsToMany('App/Models/Dashboard', 'machinelabor_dashboards', 'dashboards_machines','id','id')
    .pivotTable('dashboards_machines__machinelabor_dashboards')
  }

}

module.exports = MachineLabor

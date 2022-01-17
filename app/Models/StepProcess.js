'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const ScaffoldModel = use("ScaffoldModel");


class StepProcess extends ScaffoldModel {
  static get primaryKey() {
    return 'id'
  }

  static get table() {
    return 'stepprocess'
  }

  static get createdAtColumn() {
    return 'createdAt'
  }

  static get updatedAtColumn() {
    return 'updatedAt'
  }

  machineLabors() {
    return this.belongsToMany('App/Models/MachineLabor', 'stepprocess_machineLabors', 'machinelabor_steps', 'id', 'id')
      .pivotTable('machinelabor_steps__stepprocess_machineLabors')
  }
}

module.exports = StepProcess

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const ScaffoldModel = use("ScaffoldModel");

class Dashboard extends ScaffoldModel {
    static get primaryKey () {
        return 'id'
      }

    static get table () {
        return 'dashboards'
    }

    static get createdAtColumn () {
        return 'createdAt'
    }

    static get updatedAtColumn () {
        return 'updatedAt'
    }

    machines(){
        return this.belongsToMany('App/Models/MachineLabor', 'dashboards_machines', 'machinelabor_dashboards','id','id')
        .pivotTable('dashboards_machines__machinelabor_dashboards')
    }
}

module.exports = Dashboard

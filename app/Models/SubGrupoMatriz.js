'use strict';

// /** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
// const Model = use('Model')
const ScaffoldModel = require('./ScaffoldModel');

class SubGrupoMatriz extends ScaffoldModel {
  static get primaryKey() {
    return 'id';
  }

  static get table() {
    return 'subgrupomatriz';
  }

  static get createdAtColumn() {
    return 'createdAt';
  }

  static get updatedAtColumn() {
    return 'updatedAt';
  }

  static get with() {
    return ['camisaObj', 'hasteObj']
  }

  camisaObj() {
    return this.belongsTo('App/Models/MatrizCalculoCilindro', 'camisa', 'id');
  }

  hasteObj(){
    return this.belongsTo('App/Models/MatrizCalculoCilindro', 'haste', 'id');
  }
}

module.exports = SubGrupoMatriz;

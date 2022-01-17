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
}

module.exports = SubGrupoMatriz;

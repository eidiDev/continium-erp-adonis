'use strict';

// /** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
// const Model = use('Model')
const ScaffoldModel = require('./ScaffoldModel');

class MatrizCalculoCilindro extends ScaffoldModel {
  static get primaryKey() {
    return 'id';
  }

  static get table() {
    return 'matrizcalculocilindro';
  }

  static get createdAtColumn() {
    return 'createdAt';
  }

  static get updatedAtColumn() {
    return 'updatedAt';
  }
}

module.exports = MatrizCalculoCilindro;

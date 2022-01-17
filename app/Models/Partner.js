'use strict';

// /** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
// const Model = use('Model')
const ScaffoldModel = require('./ScaffoldModel');

class Partner extends ScaffoldModel {
  static get primaryKey() {
    return 'id';
  }

  static get table() {
    return 'partner';
  }

  static get createdAtColumn() {
    return 'createdAt';
  }

  static get updatedAtColumn() {
    return 'updatedAt';
  }
}

module.exports = Partner;

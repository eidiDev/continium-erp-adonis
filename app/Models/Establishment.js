'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const ScaffoldModel = use("ScaffoldModel");


class Establishment extends ScaffoldModel {
  static get primaryKey() {
    return 'id'
  }

  static get table() {
    return 'establishment'
  }

  static get createdAtColumn() {
    return 'createdAt'
  }

  static get updatedAtColumn() {
    return 'updatedAt'
  }
}

module.exports = Establishment

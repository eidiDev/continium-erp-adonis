'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");

class Category extends ScaffoldModel {
  static get primaryKey() {
    return 'id'
  }

  static get table() {
    return 'category'
  }

  static get createdAtColumn() {
    return 'createdAt'
  }

  static get updatedAtColumn() {
    return 'updatedAt'
  }
}

module.exports = Category

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const ScaffoldModel = use("ScaffoldModel");


class Product extends ScaffoldModel {
  static get primaryKey() {
    return 'id'
  }

  static get table() {
    return 'product'
  }

  static get createdAtColumn() {
    return 'createdAt'
  }

  static get updatedAtColumn() {
    return 'updatedAt'
  }

  static get with() {
    return ['kit', 'categoryObj', 'stepXprod']
  }

  kit() {
    return this.belongsTo('App/Models/Kit', 'product', 'id');
  }

  categoryObj() {
    return this.belongsTo('App/Models/Category', 'category', 'cod');
  }

  stepXprod() {
    return this.hasMany('App/Models/Stepxprod', 'stepxprod', 'id')
  }


}

module.exports = Product

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
    return ['categoryObj', 'subgrupomatrizObj', 'kit', 'stepXprod']
  }

  kit() {
    return this.hasOne('App/Models/Kit', 'id', 'product');
  }

  categoryObj() {
    return this.belongsTo('App/Models/Category', 'category', 'id');
  }

  subgrupomatrizObj(){
    return this.belongsTo('App/Models/SubGrupoMatriz', 'subgrupomatriz', 'id');
  }

  stepXprod() {
    return this.hasOne('App/Models/Stepxprod', 'id', 'product')
  }


}

module.exports = Product

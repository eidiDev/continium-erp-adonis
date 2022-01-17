'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const ScaffoldModel = require('./ScaffoldModel');


class Stepxprod extends ScaffoldModel {

  // @belongsTo(() => Stepxprod, {
  //   foreignKey: 'profileUserId',
  // })
  
 
  static get primaryKey() {
    return 'id'
  }

  static get table() {
    return 'stepxprod'
  }

  static get createdAtColumn() {
    return 'createdAt'
  }

  static get updatedAtColumn() {
    return 'updatedAt'
  }

  productObj() {
    return this.belongsTo('App/Models/Product', 'product', 'id')
  }
  establishmentsObj () {
    return this.belongsTo('App/Models/Establishment', 'establishment', 'id')
  }
}

module.exports = Stepxprod

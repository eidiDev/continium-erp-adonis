'use strict';

// /** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
// const Model = use('Model');

const ScaffoldModel = require('./ScaffoldModel');

class Customer extends ScaffoldModel {
  // static get visible() {
  //   return ['id', 'created_at'];
  // }

  static get hidden() {
    return ['updated_at'];
  }

  //Validations
  static get rules() {
    return {
      tipo: 'required',
      cpf_cnpj: 'required|unique:customers',
    };
  }

  // Relationships
  static get with() {
    return ['users'];
  }

  users() {
    return this.hasMany('App/Models/User');
  }
}

module.exports = Customer;

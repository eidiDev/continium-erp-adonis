'use strict'

const { find } = require('../../Models/Stepxprod');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with stepxprods
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/Stepxprod");

class StepxprodController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }

  async searchByProductId({ request, response }) {


    let { idProduct } = request.params

    try {
      var results = await this.resource.model.query()
        .where('product', idProduct)
        .with('productObj')
        .fetch()
      response.status(200).json(results);

    }
    catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });

    }
  }

}

module.exports = StepxprodController

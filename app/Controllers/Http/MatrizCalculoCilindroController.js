'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with kits
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/MatrizCalculoCilindro");

class MatrizCalculoCilindroController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }

  async getByTipo({ request, response }) {

    let { tipo } = request.params

    try {
      var results = await this.resource.model.query()
        .where('tipo', tipo)
        .fetch()
      response.status(200).json(results);

    }
    catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });

    }


  }
}

module.exports = MatrizCalculoCilindroController

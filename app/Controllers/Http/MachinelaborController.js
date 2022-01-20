'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with kits
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/MachineLabor");

class MachinelaborController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }

  async maoDeObraByCode({request,response}) {
    console.log("mao de obra by code");
    try {
        var results = await this.resource.model.query().where({
          type: 'maoDeObra', passwordappoitment: request.params.code
        }).fetch();
        
        return response.status(200).json(results.rows)
    }catch(err) {
      console.log(err);
        response.status(500).json({"error":err.message});
    }
  }
}

module.exports = MachinelaborController

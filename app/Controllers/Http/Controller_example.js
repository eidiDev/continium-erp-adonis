'use strict';

const { default: ScaffoldController } = require('./ScaffoldController');

const Model = use('App/Models/CarrierService');

class CarrierServiceController extends ScaffoldController {
  constructor() {
    super();
    this.resource = {
      model: Model,
    };
  }

  async destroy({ response }) {
    return response.status(405).json({ message: 'Método não autorizado.' });
  }
}

module.exports = CarrierServiceController;

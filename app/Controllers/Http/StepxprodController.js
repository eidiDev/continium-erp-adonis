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



  async store({ request, response, auth }) {

    const step = request.all()

    const stepCreate = await model.create(step)


    return response.json(stepCreate)
  }


  async index({ request, response }) {


    let { page, limit } = request.only(['page', 'limit']);

    const listResponse = await this.resource.model
      .query()
      .with('productObj')
      .with('establishmentsObj')
      .paginate(page, limit);


    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 50;
    }

    return response.status(200).json(listResponse);
  }

  async show({ request, response }) {
    const { id } = request.params;

    const step = await model.find(id);


    if (!step) {
      return response.status(404).json({ error: 'Registro não encontrado' });
    }

    if (step.product) {
      await step.load('productObj');
    }

    return response.json(step);
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

  async store({ request, response }) {
    let bodyToCreate = request.all();

    try {
      const createRow = await this.resource.model.create({
        description: bodyToCreate.description,
        descriptionStep: bodyToCreate.descriptionStep,
        product: bodyToCreate.product,
        status: bodyToCreate.status,
        steps: JSON.stringify(bodyToCreate.steps)
      });

      console.log(createRow);

      const rowToReturn = await this.resource.model.query()
      .where('id', createRow.id)
      .with('productObj')
      .with('establishmentsObj')
      .fetch();

      return response.status(200).json(rowToReturn.rows[0])
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = StepxprodController

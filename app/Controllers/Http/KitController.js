'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with kits
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/Kit");

class KitController extends  ScaffoldController {
  constructor() {
    super();
    this.resource = {model}
  }
}

module.exports = KitController

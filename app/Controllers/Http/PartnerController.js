'use strict';

const ScaffoldController = use('ScaffoldController');

const model = use('App/Models/Partner');
class PartnerController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model };
  }
}

module.exports = PartnerController;

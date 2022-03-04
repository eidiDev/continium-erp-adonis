'use strict';

const ScaffoldController = use('ScaffoldController');
const Helpers = use('Helpers');
const model = use('App/Models/Partner');

let errors = {
  errorType: "O arquivo tem que ser um CSV",
}
const Excel = require('exceljs');
var fs = require('fs');
const { parse } = require('csv-parse');
var csv = require("csvtojson/v2");
class PartnerController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model };
  }

  async uploadCliente({ request, response }) {
    try {
      const arquive = request.file('avatar', {

      });

      await arquive.move(Helpers.tmpPath('uploads'), { overwrite: true });

      if (!arquive.moved()) {
        return arquive.error();
      }

      if (arquive.extname === 'csv') {
        const jsonArray = await csv({
          delimiter: "auto"
        }).fromFile(Helpers.tmpPath(`uploads/${arquive.fileName}`));

        console.log(jsonArray);

        // Criando clientes a partir do parse do csv
        await this.resource.model.createMany(jsonArray)

      } else {
        throw errors.errorType
      }
    } catch (error) {
      console.log(error);
      response.status(401).send(error)
    }
  }
}

module.exports = PartnerController;

'use strict';

const ScaffoldController = use('ScaffoldController');
const Helpers = use('Helpers');
const model = use('App/Models/Partner');

let errors = {
  errorType: "O arquivo tem que ser um CSV",
  errorDelimiter: "O sistema não identificou o delimitador do CSV, tente novamente com outro arquivo"
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

        if(jsonArray[0].name){
          for (const iterator of jsonArray) {
            const findPartner = await this.resource.model.query().where({
              cnpj: iterator.cnpj
            }).first()

            if(findPartner){
              console.log(findPartner);
              const removeIndex = jsonArray.findIndex( item => item.cnpj === findPartner.cnpj );
              // remove object
              jsonArray.splice( removeIndex, 1 );
            }
            console.log(iterator);
          }
  
          // Criando clientes a partir do parse do csv
          await this.resource.model.createMany(jsonArray)
  
        }else{
          throw errors.errorDelimiter
        }

        
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

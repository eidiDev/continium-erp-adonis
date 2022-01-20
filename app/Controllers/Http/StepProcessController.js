'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with kits
 */
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/StepProcess");
const MachineLabor = use("App/Models/MachineLabor");

class StepProcessController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }

  async store({ request, response }) {

    let req = {
      body: request.all()
    }

    req.body.cod = "1"

    try {
      const recordCreated = await this.resource.model.create(
        req.body
      );

      recordCreated.cod = `ETAPA-${("000" + recordCreated.id).slice(-6)}`
      recordCreated.save();
      recordCreated.reload();

      const maquina = await MachineLabor.findBy( 'cod', req.body.generaldata.codMaquina )
      const programador = await MachineLabor.findBy( 'cod', req.body.generaldata.codProgramador )
      const operador = await MachineLabor.findBy( 'cod', req.body.generaldata.codOperador )
      const montagem = await MachineLabor.findBy( 'cod', req.body.generaldata.codMontagem )

      if (!maquina) { } else { await recordCreated.machineLabors().attach([maquina.id]) }
      if (!programador) { } else { await recordCreated.machineLabors().attach([programador.id]) }
      if (!operador) { } else { await recordCreated.machineLabors().attach([operador.id]) }
      if (!montagem) { } else { await recordCreated.machineLabors().attach([montagem.id]) }

      const updateRecord = await this.resource.model.query().where('id', recordCreated.id)
        .with('machineLabors').fetch();


      console.log(updateRecord);

      return response.status(200).json(updateRecord.rows[0]);
    } catch (error) {
      console.log(error);
      return response.error()
    }
  }
}

module.exports = StepProcessController

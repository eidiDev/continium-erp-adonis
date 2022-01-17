'use strict'
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/LogsConsulta");


class LogsConsultaController extends ScaffoldController {
    constructor() {
        super();
        this.resource = { model }
    }
}

module.exports = LogsConsultaController

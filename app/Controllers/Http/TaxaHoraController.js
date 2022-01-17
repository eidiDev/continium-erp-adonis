'use strict' 
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/TaxaHora")

class TaxaHoraController extends ScaffoldController{
    constructor() {
        super();
        this.resource = { model }
    }
}

module.exports = TaxaHoraController

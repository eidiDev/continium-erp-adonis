'use strict'
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/LogKnapp");

class LogKnappController extends ScaffoldController {
    constructor() {
        super();
        this.resource = { model }
    }
}

module.exports = LogKnappController

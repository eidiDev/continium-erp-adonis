'use strict'
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/ConsultaStock");
const sql = require('mssql');
const user = 'ICONNECT';
const pwd = 'Cora@2018';
const url = '201.22.57.246';


class ConsultaStockController extends ScaffoldController {
    constructor() {
        super();
        this.resource = { model }
    }

    async index({ request, response }) {
      let { page, limit } = request.only(['page', 'limit']);

      let { params } = request.only(['params']);

      if (params)
          params = typeof params === 'object' ? params : JSON.parse(`${params}`);

      // console.log('params:', params);
      /**
       * Foi feito esse tratamento, pois no front end estavam vindo os parametros como objeto, entao nesse caso,
       * ele prepara o array
       */

      if (!Array.isArray(params) && params) {
          let params2 = [];

          for (var [param, value] of Object.entries(params)) {
              // console.log(param);
              // console.log(value);
              params2.push({
                  field: param,
                  value: value,
              });
          }
          // console.log(params2);
          params = params2;
      }

      if (Array.isArray(params) && params.length > 0) {
          for (let i = 0; i < params.length; i++) {
              if (typeof params[i] === 'string') {
                  params[i] = JSON.parse(params[i]);
              }
          }
      }

      // console.log('New Params:', params);

      if (!page) {
          page = 1;
      }
      if (!limit) {
          limit = 50;
      }

      // console.log(params.length);
      // console.log(params);

      // const user = await auth.getUser();

      const { columns_data_types } = await this.getCommonProps();
      // console.log(request.request.url);

      const listResponse = await this.resource.model
          .query()
          .with('logs', (log) => log.select('*').from('logs_consultas').orderBy('id', 'desc').paginate(1,10))
          .orderBy('id', 'desc')
          .paginate(page, limit);

      return response.json(listResponse);
  }

    async update({ request, response }) {
        const rules = this.resource.model.rules;
    
        if (rules) {
          const validation = await validateAll(
            request.all(),
            rules,
            validationMessages.messages
          );
    
          if (validation.fails()) {
            return response
              .status(400)
              .json({ message: 'Falha na validação', err: validation.messages() });
          }
        }
    
        const { id } = request.params;
    
        const record = await this.resource.model.find(id);
    
        if (!record) {
          return response.status(404).json({ error: 'Registro não encontrado.' });
        }
    
        const { accessible_attributes } = await this.getCommonProps();
    
        const resourceParams = request.only(accessible_attributes);
    
        record.merge(resourceParams);
    
        await record.save();
    
        await record.reload();
    
        return response.json(record);
      }


    async loginAppStock ({request, response}) {
        const {name, password} = request.all();

        try {
            const findUser = await this.resource.model.query().where({username: name, senha: password}).fetch();

            if(findUser.rows.length === 0){
                return response.status(400)
            }else{
                return response.status(200).json({user: findUser.rows[0].username});
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getGruposFOX ({request, response}){
        let pool = await sql.connect(`mssql://${user}:${pwd}@${url}/FOX_00001`);
        let queryText = `select Código, Descrição from [Grupos de Produtos] gdp;`
        let resultArvore = await pool.request().query(queryText);

        let listaToreturn = resultArvore.recordset;

        return listaToreturn
    }
}

module.exports = ConsultaStockController

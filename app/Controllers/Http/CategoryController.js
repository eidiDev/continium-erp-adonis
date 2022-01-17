'use strict'
const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/Category");

class CategoryController extends  ScaffoldController {
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
          .where((builder) => {
            if (Array.isArray(params)) {
              params.forEach((parameter) => {
                // console.log('parameter', parameter);
                if (parameter.field !== '') {
                  const column_type = columns_data_types.find(
                    (row) => row.column_name === parameter.field
                  );
    
                  if (
                    column_type &&
                    (parameter.value || parameter.value === false)
                  ) {
                    let operation = '=';
    
                    switch (column_type.type) {
                      case 'bool':
                        builder.where(parameter.field, '=', parameter.value);
                        break;
                      case 'int4':
                      case 'numeric':
                        operation = parameter.op ? parameter.op : '=';
                        builder.where(parameter.field, operation, parameter.value);
                        break;
                      case 'timestamptz':
                        //Como ele salva a data como timestamptz, no where ele vai buscar somente do dia
                        operation = parameter.op ? parameter.op : '>=';
                        builder.where(
                          parameter.field,
                          '>=',
                          moment(parameter.value, 'YYYY-MM-DD').format(
                            'YYYY-MM-DD 00:00:00'
                          )
                        );
                        builder.where(
                          parameter.field,
                          '<=',
                          moment(parameter.value, 'YYYY-MM-DD').format(
                            'YYYY-MM-DD 23:59:59'
                          )
                        );
                        break;
                      case 'varchar':
                        //Para o caso de procurar por valores nulos
                        if (parameter.value === 'null') {
                          if (parameter.op === '!=')
                            builder.whereNotNull(parameter.field);
                          else builder.whereNull(parameter.field);
                        } else {
                          operation = parameter.op ? parameter.op : 'ilike';
                          var valueToFind =
                            operation === 'ilike'
                              ? '%' + parameter.value + '%'
                              : parameter.value;
                          builder.where(parameter.field, operation, valueToFind);
                        }
                        break;
                      default:
                        break;
                    }
                  }
                }
              });
            }
          })
          .select(this.resource.model.visible)
          .orderBy('cod', 'desc')
          .paginate(page, limit);
    
        if (this.resource.model.with) {
          for (let record of listResponse.rows) {
            await record.loadMany(this.resource.model.with);
          }
        }
        return response.json(listResponse);
      }
    
      
}

module.exports = CategoryController

'use strict'

const ScaffoldController = use('ScaffoldController');
const model = use("App/Models/Dashboard");
const NoteProd= use("App/Models/NoteProd");
const OrderProdMaquina = use("App/Models/OrderProdMaquina");
const moment = require('moment')

class DashboardController extends ScaffoldController {
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
            .orderBy('id', 'desc')
            .with('machines')
            .paginate(page, limit);

        if (this.resource.model.with) {
            for (let record of listResponse.rows) {
                await record.loadMany(this.resource.model.with);
            }
        }
        return response.json(listResponse);
    }


    async store({ request, response }) {
        let req = {
            body: request.all()
        }

        const listaDeMaquinas = req.body.listofMaquinas;
        console.log(listaDeMaquinas);
        delete req.body.listofMaquinas;



        try {
            const recordCreated = await this.resource.model.create(
                req.body
            );

            for (const iterator of listaDeMaquinas) {
                delete iterator.key
                await recordCreated.machines().attach([iterator.id])
            }

            const updateRecord = await this.resource.model.query().where('id', recordCreated.id)
                .with('machines').fetch();


            console.log(updateRecord);

            return response.status(200).json(updateRecord.rows[0]);
        } catch (error) {
            console.log(error);
            return response.error()
        }
    }


    async show({ request, response }) {
        const { id } = request.params;

        const record = await this.resource.model.query().where('id', id).with('machines').fetch();

        if (!record) {
            return response.status(404).json({ error: 'Registro não encontrada' });
        }

        return response.json(record.rows[0]);
    }

    async update({ request, response }) {
        let req = {
            body: request.all()
        }

        console.log('update...');
        const listaDeMaquinas = req.body.listofMaquinas;
        //console.log(listaDeMaquinas);
        delete req.body.listofMaquinas;

        // let dashboard = await Dashboards.updateOne({ id: req.params.id }).set(
        //   req.body
        // );

        try {

            let dashboard = await this.resource.model.findBy('id', request.params.id)

            await this.resource.model.query().where({ id: request.params.id }).update(req.body);
            await dashboard.machines().detach();

            for (const iterator of listaDeMaquinas) {
                //await Dashboards.addToCollection(dashboard.id, 'machines', iterator.id);
                delete iterator.key
                await dashboard.machines().attach([iterator.id])
            }

            const retorno = await this.resource.model.query().where('id', request.params.id).with('machines').fetch()

            return response.status(200).json(retorno.rows[0]);
        } catch (error) {
            console.log(error);
        }
    }

    
  async returnInitHour ({request, response}) {
    const orderId = request.params.id;
    // console.log('orderId',orderId);
    let apontamento = await NoteProd.query()
    .where({ orderProd: orderId, dataFim: '' }).with('etapaObj').with('colaboradorObj').fetch();
    // const apontamento = await NoteProd.find({ orderProd: orderId, dataFim: '' })
    //   .populate('etapa')
    //   .populate('colaborador');
    // console.log(apontament
    
    apontamento = apontamento.rows[0];

    return response.status(200).json({ apontamento, serverTime: moment() });
  }

  async returnOrderProdMaquina ({request, response}) {
    try {
    const dashboards = request.params.idsDashboards.split(',');
    // console.log(ids);
    
    let dash = await this.resource.model.query()
    .whereIn('cod',dashboards)
    .with('machines').fetch();
    
    dash = dash.rows

    let ids = [];

    dash.forEach((dashboard) => {
       dashboard = dashboard.toJSON(); 
      dashboard.machines.forEach((value) => {
        ids.push(value.cod);
      });
    });

    //console.log(ids);

    // let resposta = await OrderProdMaquina.query().whereIn('maquina', ids)
    // .orWhereIn('montagem', ids).with('orderProdObj').fetch()


    let resposta = dash
    return response.status(200).json(resposta);

} catch (error) {
    console.log(error);
}
  }
}

module.exports = DashboardController

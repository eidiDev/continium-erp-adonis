'use strict';

const { validateAll } = use('Validator');
const validationMessages = use('App/helpers/validationMessages');
class ScaffoldController {
  constructor() {
    this.resource = {};
  }

  async store({ request, auth, response }) {


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

    const { accessible_attributes } = await this.getCommonProps();

    var objectToSave = request.only(accessible_attributes);

    if (accessible_attributes.includes('user_id')) {
      const user = await auth.getUser();
      objectToSave.user_id = user.id;
    }

    //verificar se algum campo do objeto para criacao é um array
    for (var property in objectToSave){
      let value = objectToSave[property];

      if (value instanceof Array) {
        value = JSON.stringify(value);
        objectToSave[property] = value;
      }
    }

    const recordCreated = await this.resource.model.create(objectToSave);

    //Verifica tem tem relacoes hasMany
    if (this.resource.model.with) {
      for (var relation of this.resource.model.with) {
        var { items } = request.only([relation]);
        if (items) {
          var childrensCreated = await eval(
            `recordCreated.${relation}().createMany(items)`
          );
        }
      }
    }
    await recordCreated.reload();

    if (this.resource.model.with) {
      await recordCreated.loadMany(this.resource.model.with);
    }

    return response.json(recordCreated);
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
      .paginate(page, limit);

    if (this.resource.model.with) {
      for (let record of listResponse.rows) {
        await record.loadMany(this.resource.model.with);
      }
    }
    return response.json(listResponse);
  }

  async show({ request, response }) {
    const { id } = request.params;

    const record = await this.resource.model.find(id);

    if (!record) {
      return response.status(404).json({ error: 'Registro não encontrada' });
    }

    if (this.resource.model.with) await record.loadMany(this.resource.model.with);

    return response.json(record);
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

    //Atualiza os filhos
    //Verifica tem tem relacoes hasMany
    if (this.resource.model.with) {
      for (var relation of this.resource.model.with) {
        var { items } = request.only([relation]);
        if (items) {
          await eval(`record.${relation}().delete()`);
          var childrensCreated = await eval(
            `record.${relation}().createMany(items)`
          );
        }
      }
    }

    await record.reload();
    if (this.resource.model.with) {
      await record.loadMany(this.resource.model.with);
    }

    return response.json(record);
  }

  async destroy({ request, response }) {
    const { id } = request.params;

    const record = await this.resource.model.find(id);

    if (!record) {
      return response.status(404).json({ error: 'Registro não encontrada.' });
    }

    await record.delete();

    return response.json({ message: `Registro ${id} deletado` });
  }

  async destroySelected({ request, response }) {
    const { ids } = request.body;

    let recordsToDelete = [];

    recordsToDelete = await this.resource.model
      .query()
      .whereIn('id', ids)
      .delete();

    if (!recordsToDelete) {
      return response.status(404).json({ error: 'Registros não encontradas' });
    }

    return response.json({
      message: `Rgistros ${usersToDelete} deletados`,
    });
  }

  async changeStatusSelected({ request, response }) {
    const { ids, status } = request.body;

    console.log(status);

    if (!ids || !(status === 0 || status === 1)) {
      return response.status(400).json({ error: 'ids e status obrigatório.' });
    }

    const recordsUpdated = await this.resource.model
      .query()
      .whereIn('id', ids)
      .update({ is_active: status });

    if (!recordsUpdated) {
      return response
        .status(400)
        .json({ error: 'Nenhum registro encontradas com os ids enviaados' });
    }

    return response.json({
      message: `#${recordsUpdated} registros atualizados.`,
    });
  }

  getCommonProps = async () => {
    const { resource, constructor } = this;
    const { accessible_attributes } = await resource.model.getColumns();
    const { columns_data_types } = await resource.model.getDataTypes();
    // const { tables } = await resource.model.getTables();
    const nameController = constructor.name;
    return {
      resource,
      nameController,
      accessible_attributes,
      columns_data_types,
    };
  };
}

module.exports = ScaffoldController;

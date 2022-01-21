'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */

const ScaffoldController = use('./ScaffoldController');
const model = use("App/Models/User");
const Hash = use('Hash')


class UserController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }

  async register({ request, auth }) {
    let data = request.only(['username', 'email', 'password', 'role']);

    if (data.password) {
      data.password = await Hash.make(data.password)
    }


    const user = await this.resource.model.create(data)

  
    return user
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

    for (var property in resourceParams) {
      let value = resourceParams[property];

      if (value instanceof Array) {
        value = JSON.stringify(value);
        resourceParams[property] = value;
      }
    }

    record.merge(resourceParams);

    let passHash;
    if (record.password) {
      passHash = await Hash.make(record.password)
    }

    await this.resource.model.query().where({ id: record.id }).update({
      email: record.email,
      password: passHash,
      username: record.username,
      role: record.role
    })


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
}

module.exports = UserController

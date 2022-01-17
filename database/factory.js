'use strict';

const Factory = require('@adonisjs/lucid/src/Factory');

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory')

// Factory.blueprint('App/Models/User', (faker) => {
//   return {
//     username: faker.username()
//   }
// })

Factory.blueprint('App/Model/CitiesList', (faker) => {
  return {
    uf: 'PR',
    cidade: 'Toledo',
    cep_inicial: faker.integer({ min: 85900000, max: 85999999 }),
    cep_final: faker.integer({ min: 85900000, max: 85999999 }),
    tipo_tarifa: 1,
  };
});

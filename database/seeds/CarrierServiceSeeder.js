'use strict';

/*
|--------------------------------------------------------------------------
| CarrierServiceSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const CarrierService = use('App/Models/CarrierService');

class CarrierServiceSeeder {
  async run() {
    await CarrierService.createMany([
      {
        name: 'Rodoviaria',
      },
      {
        name: 'Economica',
      },
      {
        name: 'Cargo',
      },
      {
        name: '.com',
      },
      {
        name: 'Package',
      },
      {
        name: 'Expresso',
      },
      {
        name: 'Doc',
      },
      {
        name: 'Pickape',
      },
    ]);
  }
}

module.exports = CarrierServiceSeeder;

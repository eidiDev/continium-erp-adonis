'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Hash = use('Hash')
const ScaffoldModel = use("ScaffoldModel");

class User extends ScaffoldModel {

    static boot () {
        super.boot()
    
        /**
         * A hook to hash the user password before saving
         * it to the database.
         */
        this.addHook('beforeSave', async (userInstance) => {
          console.log("HEYYYYYY");
          if (userInstance.dirty.password) {
            userInstance.password = await Hash.make(userInstance.password)
          }
        })

        this.addHook('afterCreate', async (item) => {
          if (item.dirty.password) {
            item.password = await Hash.make(item.password)
          }
        });

        this.addHook('afterUpdate', async (userInstance) => {
          if (userInstance.dirty.password) {
            userInstance.password = await Hash.make(userInstance.password)
          }
        })
    }

    static get hidden() {
      return ['password'];
    }

    static get createdAtColumn() {
        return 'createdAt';
      }
    
    static get updatedAtColumn() {
    return 'updatedAt';
    }

    tokens () {
    return this.hasMany('App/Models/Token')
    }
}

module.exports = User

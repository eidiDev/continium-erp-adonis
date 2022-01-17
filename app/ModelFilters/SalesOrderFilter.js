'use strict'

const ModelFilter = use('ModelFilter')

class SalesOrderFilter extends ModelFilter {
    // company (id) {
    //     return this.where('company_id', +id)
    //   }
     
    pedido_fox (pedidofox) {
    return this.where(function () {
        //this.where('pedido_fox', 'LIKE', `%${pedidofox}%`)
        this.where('pedido_fox',1)
        // .orWhere('last_name', 'LIKE', `%${name}%`)
    })
    }

    pedido_cliente (pedidocliente) {
        return this.where(function () {
            this.where('pedido_cliente', 'LIKE', `%${pedidocliente}%`)
            //.orWhere('last_name', 'LIKE', `%${name}%`)
    })
    }

    // cfop (cfop) {
    //     return this.where('cfop', 'LIKE', `${cfop}%`)
    // }
}

module.exports = SalesOrderFilter

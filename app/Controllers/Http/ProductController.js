'use strict'
const ScaffoldController = use('ScaffoldController');
const Drive = use('Drive');
const model = use('App/Models/Product');
const { Console } = require('console');
const crypto = require('crypto');
const Helpers = use('Helpers');
const fs = require('fs');
const Database = use('Database');


class ProductController extends ScaffoldController {
  constructor() {
    super();
    this.resource = { model }
  }


  async uploadAvatar({ request, response }) {
    const idProduto = request.params.id;

    try {

      const arquive = request.file('avatar', {
        types: ['image', 'pdf'],
        size: '100mb'
      });

      await arquive.move(Helpers.tmpPath('uploads'), { overwrite: true });

      if (!arquive.moved()) {
        return arquive.error();
      }

      const updateProdct = await model.query()
        .where('id', idProduto).update({
          principalArch: {
            uid: idProduto,
            name: arquive.fileName,
            status: arquive.status,
            url: Helpers.tmpPath(`uploads/${arquive.fileName}`),
            type: arquive.type,
          }
        });

      if (updateProdct === 1) {
        return response.ok()
      }

      // await Drive.put(`uploads/${arquive.clientName}`, arquive.stream)
      //   .then(async function (data) {
      //     const updateProdct = await model.query()
      //       .where('id', idProduto).update({
      //         principalArch: {
      //           uid: idProduto,
      //           name: arquive.clientName,
      //           status: arquive.status,
      //           url: Helpers.tmpPath(`uploads/${nomearq}`),
      //           type: arquive.type,
      //         }
      //       });

      //     if (updateProdct === 1) {
      //       return response.ok()
      //     }
      //   })
      //   .catch(function (err, res) {
      //     console.log(err);
      //   });
    } catch (error) {
      console.log(error);
    }
  }

  async uploadManyFiles({ request, response }) {

    try {
      const arquive = request.file('arquivos', {
        types: ['image', 'pdf'],
        size: '100mb'
      });

      if (arquive._files != undefined) {
        await arquive.moveAll(Helpers.tmpPath('uploads'))

        if (!arquive.movedAll()) {
          return arquive.errors()
        }
      } else {
        await arquive.move(Helpers.tmpPath('uploads'), { overwrite: true });

        if (!arquive.moved()) {
          return arquive.error()
        }
      }

      let identy = request.params.id

      let lista = [];

      let pr = await this.resource.model.findBy('id', parseInt(identy));

      if (pr) {
        if (pr.listadefile === null) {
          lista = [];
        } else {
          lista = pr.listadefile;
        }
      }

      if (arquive._files === undefined) {
        var last = lista[lista.length - 1];

        lista.push({
          uid: last === undefined ? 1 : last.uid + 1,
          name: arquive.fileName,
          status: arquive.status,
          url: Helpers.tmpPath(`uploads/${arquive.fileName}`),
          type: arquive.type,
        });
      } else {
        for (let index = 0; index < _files.length; index++) {
          const element = _files[index];

          var last = lista[lista.length - 1];

          lista.push({
            uid: last === undefined ? 1 : last.uid + 1,
            name: element.fileName,
            status: element.status,
            url: Helpers.tmpPath(`uploads/${element.fileName}`),
            type: element.type,
          });
        }
      }

      const updateRecord = await this.resource.model.query().where('id', request.params.id)
        .update({
          listadefile: JSON.stringify(lista),
        });

      if (updateRecord === 1) {
        return response.ok();
      }

    } catch (error) {
      console.log(error);
    }
  }

  async getFiles({ request, response }) {
    try {
      const obj = request.all();
      // // var fileAdapter = SkipperDisk(/* optional opts */);

      if (Object.keys(obj).length !== undefined) {
        let file = require('path').resolve(obj.url);

        const isExist = await Drive.exists(Helpers.tmpPath(`uploads/${obj.name}`));

        if (isExist) {
          response.header(
            'Content-disposition',
            `attachment; filename=${obj.name}`
          );

          return response.attachment(Helpers.tmpPath(`uploads/${obj.name}`));
        }
        return response.json({ error: 'File not Found' });;

      } else {
        return response.json({ error: 'File not Found' });
      }
    } catch (err) {
      console.error(err);
    }
  }


  async updateMainFileList({ request, response }) {
    const produto = request.all();

    let findProd = await this.resource.model.findBy('id', produto.id);

    if (findProd) {
      let lista = [];

      lista.push(findProd.principalArch);

      return response.status(200).json(lista);
    }
  }

  async updateSecondList({ request, response }) {
    try {
      const produto = request.all();

      let findProd = await this.resource.model.findBy('id', produto.id);

      if (findProd) {
        let lista = [];

        lista.push(findProd.listadefile);

        return response.status(200).json(lista);
      }

    } catch (error) {
      console.log(error);
    }
  }

  async removeFiles ({request,response}) {
    let req = {
      body: request.all()
    }

    const arquivoFront = req.body.file;
    const pro = req.body.prod;

    const path = arquivoFront.url;

    try {
      fs.unlinkSync(path);
      //file removed
      let geProdct = await this.resource.model.query()
      .where({ id: pro }).update({
        principalArch: [],
      }).returning('*');

      console.log(geProdct);

      return response.status(200).json(geProdct[0]);
    } catch (err) {
      console.error(err);
    }
  }

  async getSearch({request,response}) {
    let req = {
      query: request.all()
    }

    let str = req.query.searchText;
    let coluna = req.query.searchedColumn;

    var getSea;
    if (coluna === 'cod') {
      getSea = await this.resource.model
          .query().where('cod', 'like', `%${str}%`)
          .with('categoryObj')
          .fetch();
      
      // getSea = await Product.find({
      //   cod: { contains: str },
      // })
      //   .populate('kit')
      //   .populate('category')
      //   .populate('stepXprod');
    } else {
      if (coluna === 'description1') {
        getSea = await this.resource.model
          .query().where('description1', 'like', `%${str}%`)
          .with('categoryObj')
          .fetch();


        // getSea = await Product.find({
        //   description1: { contains: str },
        // })
        //   .populate('kit')
        //   .populate('category')
        //   .populate('stepXprod');
      }
    }

    if (coluna === 'categoryObj.description') {
      str = str + '%';
      let query = `select p.id from product p inner join category ca on p.category = ca.cod where ca.description like '${str}'`;

      let nativeCall = await Database.raw(query)

      let linhas = nativeCall.rows;
      let array = [];
      for (const iterator of linhas) {
        let pr = await this.resource.model.query().where({ id: iterator.id })
            .with('categoryObj')
            .fetch()

        // let pr = await Product.findOne({ id: iterator.id })
        //   .populate('kit')
        //   .populate('category')
        //   .populate('stepXprod');
        array.push(pr.rows[0]);
      }
      getSea = array;
    }

    return res.status(200).json(getSea);
  }

  async getTotal({request, response}) {

    let nativeCall = await this.resource.model.query().count();

    let total = nativeCall;
    total.count = parseInt(total.count);

    return response.status(200).json(total);
  }
}

async function getName(file) {
  let newName = file.clientName;

  newName = `${crypto.randomBytes(16).toString('hex')}.${file.extname}`;
  // newName = crypto.randomBytes(16).toString('hex');

  return newName;
}


module.exports = ProductController

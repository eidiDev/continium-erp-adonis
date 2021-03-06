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
    let newName = '';
    let fileObject
    let url_link

    try {

      request.multipart.file('avatar', {}, async (file) => {
        const ContentType = file.headers['content-type']
        const ACL = 'public-read'

        
        newName = await getName(file);

        fileObject = file;

        await Drive.disk('s3')
          .put(`${process.env.STORAGE_MAIN_NAME}/produtos/${newName}`, file.stream, {
            ContentType,
            ACL
          })
          .then(function (data) {
            url_link = data;
          })
          .catch(function (err, res) {
            console.log(err);
          });

      })
    
      await request.multipart.process()


      const updateProdct = await model.query()
      .where('id', idProduto).update({
        principalArch: {
          uid: idProduto,
          name: newName,
          status: fileObject.status,
          url: url_link,
          type: fileObject.type,
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
    let newName
    let fileObject
    let url_link

    try {
      request.multipart.file('arquivos', {}, async (file) => {
        const ContentType = file.headers['content-type']
        const ACL = 'public-read'

        
        newName = await getName(file);

        fileObject = file;

        await Drive.disk('s3')
          .put(`${process.env.STORAGE_MAIN_NAME}/produtos/${newName}`, file.stream, {
            ContentType,
            ACL
          })
          .then(function (data) {
            url_link = data;
          })
          .catch(function (err, res) {
            console.log(err);
        });

      });

      await request.multipart.process();

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

      if (lista.length === 0) {
        var last = lista[lista.length - 1];

        lista.push({
          uid: last === undefined ? 1 : last.uid + 1,
          name: newName,
          status: fileObject.status,
          url: url_link,
          type: fileObject.type,
        });

      } else {
        var last = lista[lista.length - 1];
        
        lista.push({
          uid: last === undefined ? 1 : last.uid + 1,
          name: newName,
          status: fileObject.status,
          url: url_link,
          type: fileObject.type,
        });

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

        return response.status(200).json({url_link: obj.url});

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

    let flagIfDeleted


    try {
      await Drive.disk('s3')
      .delete(`${process.env.STORAGE_MAIN_NAME}/produtos/${arquivoFront.name}`)
      .then(function (data) {
        flagIfDeleted = data;
        // objToSave.link = data;
      })
      .catch(function (err) {
        flagIfDeleted = false;
        console.log(err);
      });
      //file removed

      if(flagIfDeleted){
        let geProdct = await this.resource.model.query()
        .where({ id: pro }).update({
          principalArch: JSON.stringify([]),
        }).returning('*');
  
        console.log(geProdct);
  
        return response.status(200).json(geProdct[0]);
      }else{
        return response.status(400)
      }
    } catch (err) {
      console.error(err);
    }
  }

  async removeFileOfSecondList ({request,response}) {
    let req = {
      body: request.all()
    }

    const arquivoFront = req.body.file;
    const pro = req.body.prod;

    const path = arquivoFront.url;

    let flagIfDeleted;
    
    try {

      await Drive.disk('s3')
      .delete(`${process.env.STORAGE_MAIN_NAME}/produtos/${arquivoFront.name}`)
      .then(function (data) {
        flagIfDeleted = data;
        // objToSave.link = data;
      })
      .catch(function (err) {
        flagIfDeleted = false;
        console.log(err);
      });
      //file removed

      // pegar a lista de arquivos e deletar ele
      const getListFiles = await this.resource.model.query().where({id: pro}).first();
      console.log(getListFiles);
      const list = getListFiles.listadefile;

      let ListRemoved = list.filter(arquivo => arquivo.name != arquivoFront.name);
    

      let geProdct = await this.resource.model.query()
      .where({ id: pro }).update({
        listadefile: JSON.stringify(ListRemoved),
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

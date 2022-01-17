'use strict';

const { RouteResource } = require('@adonisjs/framework/src/Route/Manager');

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

//Rota base
Route.get('/', () => 'Bem vindo a API da Pneumax App');

// Route.post('/users', 'UserController.store')

//Cliente
Route.resource('partner', 'PartnerController').apiOnly();

//Product
Route.resource('product', 'ProductController').apiOnly();
Route.post('uploadAvatar/:id', 'ProductController.uploadAvatar');
Route.get('getFiles', 'ProductController.getFiles');
Route.post('uploadManyFiles/:id', 'ProductController.uploadManyFiles');
Route.get('updateMainFileList', 'ProductController.updateMainFileList');
Route.get('updateSecondList', 'ProductController.updateSecondList');
Route.post('removeFiles', 'ProductController.removeFiles');
Route.get('product/api/getSearch', 'ProductController.getSearch');
Route.get('product/api/getTotal', 'ProductController.getTotal');

//NoteProd
Route.resource('noteprod', 'NoteProdController').apiOnly();
Route.post('createOnWeb', 'NoteProdController.createOnWeb');


//OrderProd
Route.resource('orderprod', 'OrderProdController').apiOnly();
Route.post('api/orderProd/gerenciarOrdens', 'OrderProdController.gerenciarOrdens')
Route.get('api/orderProd/calculateCustOnOrder', 'OrderProdController.calculateCustOnOrder')
Route.get('/orderprod/api/getSearch', 'OrderProdController.getSearch')
Route.get('/orderprod/api/getTotal', 'OrderProdController.getTotal')


//FollowUp
Route.resource('followup', 'FollowUpController').apiOnly();
Route.post('followup/followUpObs', 'FollowUpController.followUpObs');
Route.get(
  'filterLinPdVendaFollowUp',
  'FollowUpController.filterLinPdVendaFollowUp'
);
Route.get('getSpeFollowOnOrder', 'FollowUpController.getSpeFollowOnOrder');

//ExplosiveOrder
Route.post('api/orderProd/getKitArvore', 'ExplosiveOrderController.getKitArvore');
Route.post('api/orderProd/setKitArvore', 'ExplosiveOrderController.setKitArvore');
Route.get('checkIfHasStepKit', 'ExplosiveOrderController.checkIfHasStepKit');
Route.post('api/orderProd/createOrdersKits', 'ExplosiveOrderController.createOrdersKits');



//SalesOrder
Route.resource('salesorder', 'SalesOrderController').apiOnly();

//Lin SalesOrder
Route.resource('linsalesorder', 'LinSalesOrderController').apiOnly();

//PDF relatorios
Route.post('postPdf', 'SalesOrderController.postpdf');

//Filter PdVenda
Route.get('filterPdfVenda', 'SalesOrderController.filterPdVenda');

//Filter linha PdVenda
Route.get('filterLinPdVenda', 'LinSalesOrderController.filterLinPdVenda');
Route.post(
  'validateProductLinPdVenda',
  'LinSalesOrderController.validateProductLinPdVenda'
);

//FoxControllerPedidoVenda
Route.post(
  'foxControllerPd/onCreateBasicData',
  'FoxController.onCreateBasicData'
);
Route.post('foxControllerPd/onCreateOrders', 'FoxController.onCreateOrders');

//Kit
Route.resource('kit', 'KitController').apiOnly();

//Listaorderfox
Route.resource('listapedidofox', 'ListapedidofoxController').apiOnly();

//Stepxprod
Route.get('stepxprod/searchByProductId/:idProduct', 'StepxprodController.searchByProductId');
Route.resource('stepxprod', 'StepxprodController').apiOnly();


//oncreateorders
Route.post('oncreateOrders', 'OrderProdController.oncreateOrders');

//OrderprodMaquina
Route.resource('orderprodmaquina', 'OrderProdMaquinaController').apiOnly();
Route.get('orderProdMaquina/api/getOnlyMaquinas', 'OrderProdMaquinaController.getOnlyMaquinas');
Route.get('orderProdMaquina/Maquina/:idMaquina', 'OrderProdMaquinaController.getOrderProdMaquinaByMaquina');
Route.post('orderProdMaquina/getMaquinasByPrioridade', 'OrderProdMaquinaController.getMaquinasByPrioridade');

//Session
Route.post('session', 'SessionController.create')
Route.post('/getUserSession', 'SessionController.getUserSession');


//PrioridadeController
Route.get('prioridade', 'PrioridadeController.index');
Route.patch('prioridade', 'PrioridadeController.update')
Route.post('changeStatusMaq', 'PrioridadeController.changeStatusMaq')
Route.post('changePriorMaq', 'PrioridadeController.changePriorMaq')


//Category
Route.resource('category', 'CategoryController').apiOnly();

//Establishment
Route.resource('establishment', 'EstablishmentController').apiOnly();

//StepProcess
Route.resource('stepProcess', 'StepProcessController').apiOnly();

//MachineLabor
Route.resource('machineLabor', 'MachinelaborController').apiOnly();

//Taxa Hora
Route.resource('taxahora', 'TaxaHoraController').apiOnly();

//Dashboards
Route.resource('dashboards', 'DashboardController').apiOnly();
Route.get('dashboard/returnInitHour/:id', 'DashboardController.returnInitHour');
Route.get('dashboard/returnOrderProdMaquina/:idsDashboards', 'DashboardController.returnOrderProdMaquina');



//matrizcalculocilindro
Route.get('matrizcalculocilindro/getByTipo/:tipo', 'MatrizCalculoCilindroController.getByTipo');
Route.resource('matrizcalculocilindro', 'MatrizCalculoCilindroController').apiOnly()

//subgrupomatriz
Route.resource('subgrupomatriz', 'SubGrupoMatrizController').apiOnly()

//GetSpeOnSelects

Route.post('enviarinfoknapp', "KnappController.EnviarInfoKnapp");
Route.resource('logKnapp', 'LogKnappController').apiOnly()


//Consulta Stock
Route.resource('consultastock', 'ConsultaStockController').apiOnly();
Route.post('loginAppStock', 'ConsultaStockController.loginAppStock');
Route.get('getGrouposFox', 'ConsultaStockController.getGruposFOX')

//Logs Consulta
Route.resource('logsconsultastock', 'LogsConsultaController').apiOnly();

//EstoqueFoxController
Route.post('buscarProdutoFoxEstoque',  'EstoqueFoxController.buscarProdutoFoxEstoque');
Route.post('validarCodiceEspecial',  'EstoqueFoxController.buscarCodiceEspeciais');



// dev Routes
Route.post('linOrder', 'FoxController.updateOrdersLin');


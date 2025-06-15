import users from '../modules/users/network';
import customers from '../modules/customers/network';
import products from '../modules/product/network';
import orderBuy from '../modules/orderBuyWash/network'
import payment from '../modules/payments/network'


const urlApi = "";

const routes = function (server: any) {
   server.use(urlApi + "/users", users);
   server.use(urlApi + "/customer", customers);
   server.use(urlApi + "/product", products)
   server.use(urlApi + "/order", orderBuy)
   server.use(urlApi + "/payment", payment)
};

export default routes;
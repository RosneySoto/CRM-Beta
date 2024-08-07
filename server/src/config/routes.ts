import users from '../modules/users/network';
import customers from '../modules/customers/network';
import products from '../modules/product/network';


const urlApi = "";

const routes = function (server: any) {
   server.use(urlApi + "/users", users);
   server.use(urlApi + "/customer", customers);
   server.use(urlApi + "/product", products)
};

export default routes;
import users from '../modules/users/network';
import customers from '../modules/customers/network';

const urlApi = "";

const routes = function (server: any) {
   server.use(urlApi + "/users", users);
   server.use(urlApi + "/customer", customers);
};

export default routes;
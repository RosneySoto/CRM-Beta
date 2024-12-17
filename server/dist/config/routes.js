"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = __importDefault(require("../modules/users/network"));
const network_2 = __importDefault(require("../modules/customers/network"));
const network_3 = __importDefault(require("../modules/product/network"));
const network_4 = __importDefault(require("../modules/orderBuyWash/network"));
const urlApi = "";
const routes = function (server) {
    server.use(urlApi + "/users", network_1.default);
    server.use(urlApi + "/customer", network_2.default);
    server.use(urlApi + "/product", network_3.default);
    server.use(urlApi + "/order", network_4.default);
};
exports.default = routes;

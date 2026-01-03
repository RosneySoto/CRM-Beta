"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllerError_1 = __importDefault(require("../../middleware/controllerError"));
const auth_1 = require("../../middleware/auth");
const Roles_1 = require("../../types/Roles");
const controller_1 = require("./controller");
const router = express_1.default.Router();
//Crea una orden de compra
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([Roles_1.UserRole.Admin, Roles_1.UserRole.User]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Asegurar que req.user está presente
    if (!req.user || !req.user.id) {
        return res.status(401).send('Unauthorized: No user ID found');
    }
    // Modifica los datos para incluir el createUserId desde el token
    const orderData = Object.assign(Object.assign({}, req.body), { createUserId: req.user.id });
    (0, controller_1.addOrder)(orderData)
        .then((data) => {
        switch (data.status) {
            case 201:
                res.status(201).send(data.message);
                break;
            case 420:
                res.status(420).send(data.message);
                break;
            default:
                (0, controllerError_1.default)(data, req, res);
                break;
        }
    })
        .catch((e) => {
        console.log(e);
        res.status(500).send('Unexpected Error');
    });
}));
//Muestra todas las ordenes de compra
router.get('/', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, controller_1.getAllOrders)()
        .then((data) => {
        switch (data.status) {
            case 200:
                res.status(200).send(data.message);
                break;
            case 400:
                res.status(data.status).send(data.message);
                break;
        }
    })
        .catch((e) => {
        console.log(e);
        res.status(500).send('Unexpected Error');
    });
}));
router.get('/:id', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    (0, controller_1.getOrderById)(id)
        .then((data) => {
        switch (data.status) {
            case 200:
                res.status(200).send(data.message);
                break;
            case 404:
                res.status(data.status).send(data.message);
                break;
            default:
                (0, controllerError_1.default)(data, req, res);
                break;
        }
    })
        .catch((e) => {
        console.log(e);
        res.status(500).send('Unexpected Error');
    });
}));
router.patch('/update/:id', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const orderData = req.body;
    (0, controller_1.updateOrder)(id, orderData)
        .then((data) => {
        switch (data.status) {
            case 200:
                res.status(200).send(data.message);
                break;
            case 404:
                res.status(data.status).send(data.message);
                break;
            default:
                (0, controllerError_1.default)(data, req, res);
                break;
        }
    })
        .catch((e) => {
        console.log(e);
        res.status(500).send('Unexpected Error');
    });
}));
router.delete('/delete/:id', auth_1.authenticate, (0, auth_1.authorize)([Roles_1.UserRole.Admin]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, controller_1.deleteOrderBuyPartial)(req.params.id)
        .then((data) => {
        switch (data.status) {
            case 200:
                res.status(200).send(`Order Buy ${req.params.id} deleted`);
                break;
            case 400:
                res.status(data.status).send(data.message);
                break;
        }
        ;
    })
        .catch((e) => {
        console.log(e);
        res.status(500).send('Unexpected Error');
    });
}));
exports.default = router;

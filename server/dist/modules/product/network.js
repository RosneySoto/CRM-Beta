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
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const Roles_1 = require("../../types/Roles");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([Roles_1.UserRole.Admin, Roles_1.UserRole.User]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, controller_1.addProduct)(req.body)
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
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([Roles_1.UserRole.Admin, Roles_1.UserRole.User
]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, controller_1.findProductById)(req.params.id)
        .then((data) => {
        switch (data.status) {
            case 200:
                res.status(201).send(data.message);
                break;
            case 400:
                res.status(400).send(data.message);
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
router.put('/update', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idProduct = req.body.id;
    const productData = req.body;
    if (!idProduct) {
        return res.status(404).send('Producto no encontrado');
    }
    const result = yield (0, controller_1.updateProduct)(idProduct, productData);
    if (!result) {
        return res.status(404).send('Error al buscar y editar el producto');
    }
    res.status(200).send({
        message: 'User updated successfully',
        data: result.message
    });
}));
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([Roles_1.UserRole.Admin]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, controller_1.deleteProduct)(req.params.id)
        .then((data) => {
        switch (data.status) {
            case 200:
                res.status(200).send(`Customer ${req.params.id} deleted`);
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
exports.default = router;

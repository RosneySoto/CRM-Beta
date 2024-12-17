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
const controller_1 = require("./controller");
const auth_2 = require("../../middleware/auth");
const Roles_1 = require("../../types/Roles");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, (0, auth_2.authorize)([Roles_1.UserRole.Admin]), function (req, res) {
    (0, controller_1.addUser)(req.body)
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
});
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json('User data is missing');
    }
    const result = yield (0, controller_1.loginUser)(email, password);
    if (result.status !== 200 || !result.user) {
        return res.status(result.status).send(result.message);
    }
    req.user = result.user;
    next();
}), auth_1.generateToken, (req, res) => {
    res.status(200).send({
        message: 'Login successful',
        token: req.token,
    });
});
router.put('/update', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userData = req.body;
    if (!userId) {
        return res.status(401).send('No estas autorizado');
    }
    const result = yield (0, controller_1.updateUser)(userId, userData);
    if (result.status !== 200 || !result.user) {
        return res.status(result.status).send(result.message);
    }
    res.status(200).send({
        message: 'User updated successfully',
        user: result.user
    });
}));
router.delete('/:id', auth_1.authenticate, (0, auth_2.authorize)([Roles_1.UserRole.Admin]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, controller_1.deleteUserPartial)(req.params.id)
        .then((resp) => {
        switch (resp.status) {
            case 200:
                res.status(200).send(`User ${req.params.id} deleted`);
                break;
            case 400:
                res.status(resp.status).send(resp.message);
                break;
        }
    })
        .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
    });
}));
exports.default = router;

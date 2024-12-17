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
exports.authorize = exports.authenticate = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const commons_1 = __importDefault(require("../config/commons"));
const model_1 = __importDefault(require("../modules/roles/model"));
const generateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        return res.status(401).send('unauthorized');
    }
    const payload = {
        id: user.id,
        roleId: user.roleId
    };
    const token = jsonwebtoken_1.default.sign(payload, commons_1.default.jwt_secret, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });
    req.token = token;
    // console.log('[TOKEN] ' + token);
    next();
});
exports.generateToken = generateToken;
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send('unauthorized');
        }
        ;
        const decoded = jsonwebtoken_1.default.verify(token, commons_1.default.jwt_secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).send('unauthorized');
    }
    ;
});
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).send('unauthorized');
            }
            const decoded = jsonwebtoken_1.default.verify(token, commons_1.default.jwt_secret);
            req.user = decoded;
            // Obtener el rol del usuario
            const userRole = yield model_1.default.findById(req.user.roleId);
            // Verificar si el rol del usuario tiene permisos suficientes
            if (!userRole || !roles.includes(userRole.name)) {
                return res.status(403).send('You not have authorization');
            }
            next();
        }
        catch (err) {
            console.error('Error en la autorización:', err);
            return res.status(401).send('unauthorized');
        }
    });
};
exports.authorize = authorize;

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
const model_2 = __importDefault(require("../modules/users/model"));
const model_3 = __importDefault(require("../modules/sessions/model"));
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
    next();
});
exports.generateToken = generateToken;
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token;
        // Buscar token en cookies o headers
        token = req.cookies.token || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        // PRIMERO: Buscar la sesión sin populate
        const session = yield model_3.default.findOne({
            token,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        if (!session) {
            return res.status(401).json({ error: 'Sesión inválida o expirada' });
        }
        // SEGUNDO: Buscar el usuario manualmente
        const userDoc = yield model_2.default.findById(session.userId).select('name lastname email roleId active');
        if (!userDoc) {
            console.log('❌ Usuario no encontrado para ID:', session.userId);
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        console.log('✅ Usuario encontrado:', userDoc.name, userDoc.lastname);
        // Convertir a UserType y asignar
        req.user = {
            id: userDoc._id.toString(),
            name: userDoc.name,
            lastname: userDoc.lastname,
            email: userDoc.email,
            roleId: userDoc.roleId.toString(),
            active: userDoc.active,
            image: userDoc.image || ''
        };
        req.sessionId = session._id.toString(); // Convertir ObjectId a string
        // Actualizar última actividad
        yield model_3.default.updateOne({ _id: session._id }, { lastActivity: new Date() });
        next();
    }
    catch (err) {
        console.error('❌ Error de autenticación:', err);
        return res.status(401).json({ error: 'Error de autenticación' });
    }
});
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // El usuario ya fue autenticado por el middleware authenticate
            // req.user ya contiene el objeto completo del usuario
            if (!req.user) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }
            // Obtener el rol del usuario
            const userRole = yield model_1.default.findById(req.user.roleId);
            if (!userRole) {
                return res.status(403).json({ error: 'Rol de usuario no encontrado' });
            }
            // Verificar si el rol del usuario tiene permisos suficientes
            if (!roles.includes(userRole.name)) {
                return res.status(403).json({ error: 'No tienes permisos suficientes' });
            }
            console.log('✅ Autorización exitosa');
            next();
        }
        catch (err) {
            console.error('❌ Error en la autorización:', err);
            return res.status(403).json({ error: 'Error de autorización' });
        }
    });
};
exports.authorize = authorize;

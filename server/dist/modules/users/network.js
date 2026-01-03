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
const model_1 = __importDefault(require("./model")); // Agregar esta importación
const model_2 = __importDefault(require("../sessions/model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const commons_1 = __importDefault(require("../../config/commons"));
const router = express_1.default.Router();
//Crea un usuario nuevo
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
//Logeo de usuario
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Datos de usuario faltantes');
    }
    const result = yield (0, controller_1.loginUser)(email, password);
    if (result.status !== 200 || !result.user) {
        return res.status(result.status).send(result.message);
    }
    // Generar token JWT
    const token = jsonwebtoken_1.default.sign({ id: result.user.id, roleId: result.user.roleId }, // Usar result.user.id
    commons_1.default.jwt_secret, { expiresIn: '24h' });
    // Crear sesión en base de datos
    const session = new model_2.default({
        userId: result.user.id,
        token,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    yield session.save();
    res.status(200).send({
        message: 'Login successful',
        token: token,
        user: {
            id: result.user.id,
            name: result.user.name,
            lastname: result.user.lastname,
            email: result.user.email
        }
    });
}));
//Edita un usuario
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
//Elimina de manera pasiva un cliente
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
//Obtener información del usuario actual
router.get('/me', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            return res.status(401).json({
                error: 'No autorizado',
                success: false
            });
        }
        // Buscar el usuario por ID y popular el rol
        const user = yield model_1.default.findById(userId)
            .select('-password') // Excluir la contraseña por seguridad
            .populate('roleId', 'name'); // Popular el nombre del rol
        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                success: false
            });
        }
        // Devolver la información del usuario
        res.json({
            id: user._id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            image: user.image,
            role: user.roleId,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    }
    catch (error) {
        console.error('Error al obtener información del usuario:', error);
        res.status(500).json({
            error: 'Error al obtener información del usuario',
            success: false
        });
    }
}));
//Logout
router.post('/logout', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        // Marcar la sesión como inactiva
        yield model_2.default.findByIdAndUpdate(req.sessionId, {
            isActive: false,
            lastActivity: new Date()
        });
        console.log(`Usuario ${(_c = req.user) === null || _c === void 0 ? void 0 : _c.name} cerró sesión - Sesión invalidada`);
        res.json({
            message: 'Sesión cerrada exitosamente',
            success: true
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Error al cerrar sesión',
            success: false
        });
    }
}));
exports.default = router;

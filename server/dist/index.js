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
const commons_1 = __importDefault(require("./config/commons"));
const db_1 = __importDefault(require("./config/db"));
const routes_1 = __importDefault(require("./config/routes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const pdf_1 = require("./utils/pdf");
// IMPORTAR TODOS LOS MODELOS PARA REGISTRARLOS EN MONGOOSE
require("./modules/users/model");
require("./modules/customers/model");
require("./modules/product/model");
require("./modules/orderBuyWash/model");
require("./modules/payments/model");
require("./modules/roles/model");
require("./modules/sessions/model"); // ← IMPORTAR EL MODELO DE SESIONES
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
// app.use(express.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
(0, db_1.default)(commons_1.default.dbConnectUri);
(0, routes_1.default)(app);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const server = app.listen(commons_1.default.port, () => {
    console.log(`Server is running on ${commons_1.default.host}:${commons_1.default.port}`);
});
// Manejo de cierre graceful
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Recibida señal SIGINT, cerrando servidor...');
    yield (0, pdf_1.closeBrowser)();
    server.close(() => {
        console.log('Servidor cerrado correctamente');
        process.exit(0);
    });
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Recibida señal SIGTERM, cerrando servidor...');
    yield (0, pdf_1.closeBrowser)();
    server.close(() => {
        console.log('Servidor cerrado correctamente');
        process.exit(0);
    });
}));

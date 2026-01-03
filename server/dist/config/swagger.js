"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API control cliente',
            version: '1.0.0',
            description: 'API para manejar el control de ventas de un autolavado',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [path_1.default.resolve(__dirname, '../doc/*.yml')],
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;

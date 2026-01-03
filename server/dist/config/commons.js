"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConnectUri = process.env.MONGO_URI;
const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'http://localhost:3000',
    dbConnectUri: dbConnectUri,
    jwt_secret: process.env.JWT_SECRET
};
exports.default = config;

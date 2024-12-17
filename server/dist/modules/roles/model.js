"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const Roles_1 = require("../../types/Roles");
const rolSchema = new Schema({
    name: {
        type: String,
        enum: Object.values(Roles_1.UserRole),
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const Roles = mongoose_1.default.model("Roles", rolSchema);
exports.default = Roles;

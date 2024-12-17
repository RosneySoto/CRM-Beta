"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true
    },
    lastname: {
        type: String,
        required: [true, "Please enter your lastname"],
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'Enter a valid email address.'],
        required: [true, "Please enter your email address"]
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    roleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Roles',
        required: true,
    }
}, { timestamps: true });
const Users = mongoose_1.default.model("Users", userSchema);
exports.default = Users;

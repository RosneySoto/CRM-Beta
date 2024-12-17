"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const Schema = mongoose_1.default.Schema;
const customerSchema = new Schema({
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
    numberPhone: {
        type: Number,
        required: true,
        trim: true
    },
    vehicles: {
        type: [{
                marca: {
                    type: String,
                    required: [true, "Please enter the brand of the vehicle"],
                    trim: true
                },
                modelo: {
                    type: String,
                    required: [true, "Please enter the model of the vehicle"],
                    trim: true
                },
                patente: {
                    type: String,
                    required: [true, "Please enter the license plate of the vehicle"],
                    trim: true,
                    unique: true,
                },
            }],
        required: true,
        default: []
    },
    active: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });
const Customers = mongoose_1.default.model("Customers", customerSchema);
exports.default = Customers;

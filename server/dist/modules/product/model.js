"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const productSchema = new Schema({
    product: {
        type: String,
        required: true
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true
    },
    detail: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        trim: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
}, { timestamps: true });
const Products = mongoose_1.default.model("Products", productSchema);
exports.default = Products;

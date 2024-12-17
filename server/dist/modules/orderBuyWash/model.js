"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const orderBuy = new Schema({
    nameService: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Customers',
        require: true
    },
    vehicleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        require: true
    },
    createUserId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    }
}, { timestamps: true });
const OrderBuy = mongoose_1.default.model("OrderBuy", orderBuy);
exports.default = OrderBuy;

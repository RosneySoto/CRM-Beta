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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderBuyPartial = exports.updateOrder = exports.getOrderById = exports.getAllOrders = exports.addOrder = void 0;
const store_1 = require("./store");
function addOrder(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (data.nameService === "" || data.customerId === null) {
                return {
                    status: 400,
                    message: 'Missing data'
                };
            }
            ;
            const newOrderBuy = yield (0, store_1.addOrder)(data);
            return {
                status: 201,
                message: newOrderBuy
            };
        }
        catch (error) {
            console.error('Unexpected Controller Error', error);
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error
            };
        }
        ;
    });
}
exports.addOrder = addOrder;
;
function getAllOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getAllOrders)();
            if (!result) {
                return {
                    status: 404,
                    message: 'No customers founds'
                };
            }
            return result;
        }
        catch (error) {
            console.log(error);
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error
            };
        }
    });
}
exports.getAllOrders = getAllOrders;
;
function getOrderById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getOrderById)(id);
            if (!result) {
                return {
                    status: 404,
                    message: 'Order not found'
                };
            }
            return result;
        }
        catch (error) {
            console.log(error);
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error
            };
        }
        ;
    });
}
exports.getOrderById = getOrderById;
;
function updateOrder(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.updateOrder)(id, data);
            if (!result) {
                return {
                    status: 404,
                    message: 'Order not found'
                };
            }
            return result;
        }
        catch (error) {
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error
            };
        }
    });
}
exports.updateOrder = updateOrder;
;
function deleteOrderBuyPartial(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.deleteOrderBuy)(id);
            if (!result) {
                return {
                    status: 404,
                    message: 'Order buy not found'
                };
            }
            return result;
        }
        catch (error) {
            console.log(error);
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error
            };
        }
        ;
    });
}
exports.deleteOrderBuyPartial = deleteOrderBuyPartial;
;

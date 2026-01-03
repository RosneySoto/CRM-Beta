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
exports.deleteOrderBuy = exports.updateOrder = exports.getOrderById = exports.getAllOrders = exports.addOrder = void 0;
// import customerModel from '../customers/model';
// import userModel from '../users/model';
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../customers/model"));
const model_3 = __importDefault(require("../product/model"));
// store.ts
function addOrder(orderData) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verifica la existencia del cliente y el vehículo
            const customer = yield model_2.default.findById(orderData.customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            const vehicleExists = customer.vehicles.some(vehicle => vehicle.id.toString() === orderData.vehicleId);
            if (!vehicleExists) {
                throw new Error('Vehicle not found for this customer');
            }
            const product = yield model_3.default.findById(orderData.nameService);
            if (!product) {
                throw new Error('Product not found');
            }
            const productPrice = parseFloat((_a = product.price) === null || _a === void 0 ? void 0 : _a.toString()).toFixed(2); //Se parcea el precio para que se guarde en mongo con dos decimales
            // Crea la nueva orden
            const newOrder = new model_1.default({
                nameService: orderData.nameService,
                customerId: orderData.customerId,
                vehicleId: orderData.vehicleId,
                createUserId: orderData.createUserId,
                price: productPrice,
            });
            yield newOrder.save();
            return {
                status: 201,
                message: 'Order created successfully',
                data: Object.assign(Object.assign({}, newOrder.toObject()), { price: parseFloat((_b = newOrder.price) === null || _b === void 0 ? void 0 : _b.toString()).toFixed(2) }),
            };
        }
        catch (error) {
            return {
                status: 400,
                message: error,
            };
        }
    });
}
exports.addOrder = addOrder;
;
function getAllOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Encontrar todas las órdenes de compra
            const orders = yield model_1.default.find()
                .populate({ path: 'customerId',
                select: 'name lastname email' })
                .populate({ path: 'vehicleId' })
                .populate({ path: 'nameService',
                select: 'product price' })
                .populate({ path: 'createUserId',
                select: 'name email' });
            // Si no se encuentran órdenes, lanzar un error
            if (!orders)
                throw new Error('No orders found');
            // Mapeo de las órdenes para incluir el vehículo específico
            const populatedOrders = yield Promise.all(orders.map((order) => __awaiter(this, void 0, void 0, function* () {
                const customer = yield model_2.default.findById(order.customerId);
                const vehicle = customer === null || customer === void 0 ? void 0 : customer.vehicles.find((v) => { var _a; return v.id.toString() === ((_a = order.vehicleId) === null || _a === void 0 ? void 0 : _a.toString()); });
                return Object.assign(Object.assign({}, order.toObject()), { vehicle });
            })));
            return {
                status: 200,
                message: populatedOrders,
            };
        }
        catch (e) {
            console.log('[ERROR] -> getAllOrders', e);
            return {
                status: 400,
                message: 'An error occurred while getting all orders',
                detail: e,
            };
        }
    });
}
exports.getAllOrders = getAllOrders;
;
function getOrderById(orderId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orderData = yield model_1.default.findById(orderId)
                .populate({ path: 'customerId', select: 'name lastname email vehicles' }) // Traer `vehicles`
                .populate({ path: 'nameService', select: 'product price' })
                .populate({ path: 'createUserId', select: 'name email' })
                .lean(); // Convertir a objeto JSON puro
            if (!orderData) {
                throw new Error('Order not found');
            }
            ;
            // Convertir `customerId` en un objeto con tipado correcto
            const customer = orderData.customerId;
            // Buscar el vehículo específico dentro del array de `vehicles`
            const vehicle = (_a = customer.vehicles) === null || _a === void 0 ? void 0 : _a.find((v) => { var _a; return v._id.toString() === ((_a = orderData.vehicleId) === null || _a === void 0 ? void 0 : _a.toString()); });
            if (!vehicle) {
                throw new Error('Vehicle not found for this order');
            }
            ;
            // Eliminar `vehicles` del objeto `customerId` para que no se muestre en la respuesta
            delete customer.vehicles;
            // Crear resultado final con solo el vehículo asociado
            const result = Object.assign(Object.assign({}, orderData), { customerId: customer, // Ahora sin `vehicles`
                vehicle });
            // delete result.vehicleId; // Eliminar `vehicleId` para evitar duplicados
            return {
                status: 200,
                message: result,
            };
        }
        catch (error) {
            return {
                status: 400,
                message: error,
            };
        }
        ;
    });
}
exports.getOrderById = getOrderById;
;
function updateOrder(orderId, orderData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar la existencia de la orden
            const order = yield getOrderById(orderId);
            if (!order)
                throw new Error('Order not found');
            // Validación: No permitir editar órdenes que ya fueron cobradas
            if (order.message && order.message.active === false) {
                return {
                    status: 400,
                    message: 'Cannot edit an order that has already been paid'
                };
            }
            // Actualizar la orden
            const updatedOrder = yield model_1.default.findByIdAndUpdate(orderId, orderData, { new: true });
            if (!updatedOrder)
                throw new Error('Error updating order');
            return {
                status: 200,
                message: 'Order updated successfully',
                data: updatedOrder,
            };
        }
        catch (error) {
            return {
                status: 400,
                message: error,
            };
        }
        ;
    });
}
exports.updateOrder = updateOrder;
;
function deleteOrderBuy(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundOrder = yield model_1.default.findOne({ _id: id });
            if (!foundOrder)
                throw new Error('Order not found');
            // Validación: No permitir eliminar órdenes que ya fueron cobradas
            if (foundOrder.active === false) {
                return {
                    status: 400,
                    message: 'Cannot delete an order that has already been paid'
                };
            }
            foundOrder.active = false;
            yield foundOrder.save();
            return {
                status: 200,
                message: 'The order was deleted successfully'
            };
        }
        catch (e) {
            console.log("[ERROR] -> deleteOrderBuy", e);
            return {
                status: 400,
                message: "An error occurred while deleting order",
                detail: e,
            };
        }
        ;
    });
}
exports.deleteOrderBuy = deleteOrderBuy;
;

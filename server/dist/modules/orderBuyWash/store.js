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
exports.getAllOrders = exports.addOrder = void 0;
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../customers/model"));
// export async function addOrder(data: OrderBuyType) {
//    try {
//       const newItem = new OrderBuy(data);
//       const result = await newItem.save();
//       return {
//          status: 201,
//          message: result
//       };
//    } catch (error) {
//       console.log("[ERROR] -> addOrder", error);
//       return {
//          status: 400,
//          message: "An error occurred while creating the order",
//          detail: error
//       };
//    };
// };
// export async function getAllOrder() {
//    try {
//       const allOrder = await OrderBuy.find()
//          .populate({
//             path: 'customerId',
//             select: 'name lastname vehicles._id'
//          })
//       if(!allOrder) throw new Error ('No orders found');
//       return {
//          status: 200,
//          message: allOrder
//       };
//    } catch (e) {
//       console.log("[ERROR] -> getAll", e);
//       return {
//          status: 400,
//          message: "An error occurred while getting all customers",
//          detail: e,
//       };
//    }
// }
function addOrder(orderData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Primero, verifica si el cliente existe
            const customer = yield model_2.default.findById(orderData.customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            // Verifica si el vehículo pertenece al cliente
            const vehicleExists = customer.vehicles.some(vehicle => vehicle.id.toString() === orderData.vehicleId);
            if (!vehicleExists) {
                throw new Error('Vehicle not found for this customer');
            }
            // Crea la orden de compra
            const newOrder = new model_1.default({
                nameService: orderData.nameService,
                customerId: orderData.customerId,
                vehicleId: orderData.vehicleId,
                createUserId: orderData.createUserId,
            });
            yield newOrder.save();
            return {
                status: 201,
                message: 'Order created successfully',
                data: newOrder,
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

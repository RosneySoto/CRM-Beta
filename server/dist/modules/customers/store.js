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
exports.getCustomerByEmail = exports.getByName = exports.getAllActive = exports.getAll = exports.deleteCustomer = exports.findCustomerId = exports.addCustomer = void 0;
const model_1 = __importDefault(require("./model"));
function addCustomer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newItem = new model_1.default(data);
            const result = yield newItem.save();
            return {
                status: 201,
                message: result
            };
        }
        catch (e) {
            console.log("[ERROR] -> addUser", e);
            return {
                status: 400,
                message: "An error occurred while creating the user",
                detail: e,
            };
        }
        ;
    });
}
exports.addCustomer = addCustomer;
;
function findCustomerId(id, customerData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield model_1.default.findById(id);
            if (!result) {
                return { status: 404, message: 'Customer not found' };
            }
            const data = yield model_1.default.findByIdAndUpdate(id, customerData, { new: true });
            if (!data) {
                return {
                    status: 400,
                    message: "Error updating customer"
                };
            }
            return {
                status: 200,
                customer: data
            };
        }
        catch (e) {
            console.log("[ERROR] -> findCustomerId", e);
            return {
                status: 400,
                message: "An error occurred while updating the customer",
                detail: e,
            };
        }
    });
}
exports.findCustomerId = findCustomerId;
;
function deleteCustomer(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundCustomer = yield model_1.default.findOne({ _id: id });
            if (!foundCustomer)
                throw new Error('Not customer found');
            foundCustomer.active = false;
            yield foundCustomer.save();
            return {
                status: 200,
                message: 'Customer deleted'
            };
        }
        catch (e) {
            console.log("[ERROR] -> deleteCustomer", e);
            return {
                status: 400,
                message: "An error occurred while deleting customer",
                detail: e,
            };
        }
        ;
    });
}
exports.deleteCustomer = deleteCustomer;
;
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allcustomer = yield model_1.default.find();
            if (!allcustomer)
                throw new Error('No customers found');
            return {
                status: 200,
                message: allcustomer
            };
        }
        catch (e) {
            console.log("[ERROR] -> getAll", e);
            return {
                status: 400,
                message: "An error occurred while getting all customers",
                detail: e,
            };
        }
        ;
    });
}
exports.getAll = getAll;
;
function getAllActive() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allcustomer = yield model_1.default.find({ active: true });
            if (!allcustomer)
                throw new Error('No active customers found');
            return {
                status: 200,
                message: allcustomer
            };
        }
        catch (e) {
            console.log("[ERROR] -> getAll", e);
            return {
                status: 400,
                message: "An error occurred while getting all customers",
                detail: e,
            };
        }
        ;
    });
}
exports.getAllActive = getAllActive;
;
function getByName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const regex = new RegExp(`^${name}`, 'i');
            const users = yield model_1.default.find({
                $or: [{ name: regex }, { lastname: regex }] // Busca por nombre o apellido
            });
            // Verificar si se encontraron usuarios
            if (users.length === 0)
                throw new Error('User not found');
            console.log(users);
            return {
                status: 200,
                message: users
            };
        }
        catch (e) {
            console.log("[ERROR] -> getByName", e);
            return {
                status: 400,
                message: "An error occurred while getting customers by name",
                detail: e,
            };
        }
    });
}
exports.getByName = getByName;
;
function getCustomerByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const regex = new RegExp(`^${email}`, 'i');
            const user = yield model_1.default.find({
                $or: [{ email: regex }]
            });
            if (user.length === 0)
                throw new Error('User not found');
            console.log(user);
            return {
                status: 200,
                message: user
            };
        }
        catch (e) {
            console.log("[ERROR] -> getByName", e);
            return {
                status: 400,
                message: "An error occurred while getting customers by name",
                detail: e,
            };
        }
        ;
    });
}
exports.getCustomerByEmail = getCustomerByEmail;
;

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
exports.getByEmail = exports.getByName = exports.getAllActive = exports.getAll = exports.deleteCustomerPartial = exports.updateCustomer = exports.addCustomer = void 0;
const store_1 = require("./store");
const model_1 = __importDefault(require("./model"));
function addCustomer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (data.email === "" || data.numberPhone === null || data.name === "" || data.lastname === "" || !data.email || !data.numberPhone || !data.name || !data.lastname) {
                return {
                    status: 400,
                    message: 'Faltan datos',
                };
            }
            ;
            const existingCustomer = yield model_1.default.findOne({ email: data.email });
            if (existingCustomer) {
                return {
                    status: 401,
                    message: 'Email of customer already exists',
                };
            }
            ;
            //Valida que la patente exista en la base de datos
            for (const vehicle of data.vehicles || []) {
                const existingVehicle = yield model_1.default.findOne({ 'vehicles.patente': vehicle.patente });
                if (existingVehicle) {
                    return {
                        status: 400,
                        message: `La patente ${vehicle.patente} ya está registrada`,
                    };
                }
                ;
            }
            ;
            const newCustomer = yield (0, store_1.addCustomer)(data);
            return {
                status: 201,
                message: data,
            };
        }
        catch (error) {
            console.error('Unexpected Controller Error:', error);
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error,
            };
        }
        ;
    });
}
exports.addCustomer = addCustomer;
;
function updateCustomer(id, customerData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.findCustomerId)(id, customerData);
            if (result.status !== 200) {
                return result;
            }
            return {
                status: 200,
                customer: result.customer,
                message: 'Customer updating correctly'
            };
        }
        catch (error) {
            console.error('Unexpected Controller Error:', error);
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error,
            };
        }
        ;
    });
}
exports.updateCustomer = updateCustomer;
;
function deleteCustomerPartial(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.deleteCustomer)(id);
            if (!result) {
                return {
                    status: 404,
                    message: 'Customer not found'
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
exports.deleteCustomerPartial = deleteCustomerPartial;
;
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getAll)();
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
        ;
    });
}
exports.getAll = getAll;
;
function getAllActive() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getAllActive)();
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
        ;
    });
}
exports.getAllActive = getAllActive;
;
function getByName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getByName)(name);
            console.log('CONTROLLER -> ' + result);
            if (!result) {
                return {
                    status: 404,
                    message: 'User no found'
                };
            }
            ;
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
exports.getByName = getByName;
;
function getByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getCustomerByEmail)(email);
            if (!result) {
                return {
                    status: 404,
                    message: 'User no found'
                };
            }
            ;
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
exports.getByEmail = getByEmail;
;

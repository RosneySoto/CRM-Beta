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
exports.getAllProducts = exports.deleteProduct = exports.updateProduct = exports.findProductById = exports.addProduct = void 0;
const store_1 = require("./store");
const model_1 = __importDefault(require("./model"));
function addProduct(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (data.product === "" || data.price === "") {
                return {
                    status: 400,
                    message: "Missing data"
                };
            }
            ;
            const existingProduct = yield model_1.default.findOne({ product: data.product });
            if (existingProduct) {
                return {
                    status: 401,
                    message: 'The product already exists'
                };
            }
            else {
                const newProduct = yield (0, store_1.addProduct)(data);
                return {
                    status: 201,
                    message: newProduct
                };
            }
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
exports.addProduct = addProduct;
;
function findProductById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.findProductById)(id);
            if (!result) {
                return {
                    status: 400,
                    message: "Product no found or not existing"
                };
            }
            else {
                return {
                    status: 200,
                    message: result
                };
            }
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
exports.findProductById = findProductById;
;
function updateProduct(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.updateProduct)(id, data);
            if (!result) {
                return {
                    status: 400,
                    message: 'An error occurred while updating the product'
                };
            }
            else {
                return {
                    status: 200,
                    message: result.message
                };
            }
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
exports.updateProduct = updateProduct;
;
function deleteProduct(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.deleteProduct)(id);
            console.log('*** ' + result + ' *****');
            if (!result || result.status !== 200) {
                return {
                    status: 400,
                    message: 'An error occurred while deleting product'
                };
            }
            return result;
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
exports.deleteProduct = deleteProduct;
;
function getAllProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.getAllProductsStore)();
            if (!result) {
                return {
                    status: 404,
                    message: 'No products found'
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
exports.getAllProducts = getAllProducts;
;

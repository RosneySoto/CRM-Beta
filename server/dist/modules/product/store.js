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
exports.deleteProduct = exports.updateProduct = exports.findProductById = exports.addProduct = void 0;
const model_1 = __importDefault(require("./model"));
function addProduct(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newItem = new model_1.default(data);
            const result = yield newItem.save();
            return {
                status: 201,
                message: result
            };
        }
        catch (error) {
            console.log("[ERROR] -> addProduct", error);
            return {
                status: 400,
                message: "An error occurred while creating the product",
                detail: error
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
            const result = yield model_1.default.findById(id);
            if (!result) {
                return {
                    status: 400,
                    message: 'Product no found'
                };
            }
            else {
                return {
                    status: 200,
                    message: result
                };
            }
            ;
        }
        catch (error) {
            console.log("[ERROR] -> findProductById", error);
            return {
                status: 400,
                message: "An error occurred while updating the product",
                detail: error
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
            if (!id) {
                return {
                    status: 400,
                    message: 'Product no found'
                };
            }
            const productUpdate = yield model_1.default.findByIdAndUpdate(id, data, { new: true });
            if (!productUpdate) {
                return {
                    status: 400,
                    message: 'Error, product no found'
                };
            }
            return {
                status: 200,
                message: productUpdate
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
exports.updateProduct = updateProduct;
;
function deleteProduct(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!id || id === '') {
                return {
                    status: 400,
                    message: 'Error, product not found'
                };
            }
            const productFind = yield model_1.default.findOne({ _id: id });
            if (!productFind)
                throw new Error('Product not found');
            productFind.active = false;
            yield productFind.save();
            return {
                status: 200,
                message: `Product ${id} marked as inactive`
            };
        }
        catch (e) {
            console.log("[ERROR] -> deleteProduct", e);
            return {
                status: 400,
                message: "An error occurred while deleting product",
                detail: e,
            };
        }
        ;
    });
}
exports.deleteProduct = deleteProduct;
;

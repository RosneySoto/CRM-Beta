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
exports.logoutUser = exports.deleteUserPartial = exports.updateUser = exports.loginUser = exports.addUser = void 0;
const store_1 = require("./store");
const bcrypt_1 = require("../../middleware/bcrypt");
const model_1 = __importDefault(require("./model"));
function addUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, lastname, image, email, password, roleId } = data;
            const existingUser = yield model_1.default.findOne({ email });
            if (existingUser) {
                return {
                    status: 401,
                    message: 'User already exists',
                };
            }
            ;
            let passwordHash;
            if (password && password.trim() !== '') {
                passwordHash = yield (0, bcrypt_1.encrypt)(password);
            }
            else {
                return {
                    status: 400,
                    message: 'Password is required',
                };
            }
            ;
            // Crear nuevo usuario con el ID del rol 'Admin'
            const newUser = new model_1.default({
                name,
                lastname,
                image,
                email,
                password: passwordHash,
                roleId,
            });
            const result = yield newUser.save();
            return {
                status: 201,
                message: result,
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
exports.addUser = addUser;
;
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.login)(email, password);
            if (result.status !== 200) {
                return result;
            }
            else {
                return {
                    status: 200,
                    user: result.user,
                    message: 'Login successful'
                };
            }
        }
        catch (error) {
            return {
                status: 500,
                message: 'Unexpected Controller Error',
                detail: error
            };
        }
        ;
    });
}
exports.loginUser = loginUser;
;
function updateUser(id, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.updateUser)(id, userData);
            if (!result) {
                return {
                    status: 404,
                    message: 'An error occurred while updating the user'
                };
            }
            else {
                return {
                    status: 200,
                    user: result.user
                };
            }
            ;
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
exports.updateUser = updateUser;
;
function deleteUserPartial(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.deleteUser)(id);
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
exports.deleteUserPartial = deleteUserPartial;
;
function logoutUser(res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, store_1.logout)(res);
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
exports.logoutUser = logoutUser;

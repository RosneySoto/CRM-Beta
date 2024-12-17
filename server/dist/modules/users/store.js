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
exports.deleteUser = exports.updateUser = exports.login = exports.userFindEmail = exports.addUser = void 0;
const model_1 = __importDefault(require("./model"));
const bcrypt_1 = require("../../middleware/bcrypt");
function addUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newItem = new model_1.default(data);
            const result = yield newItem.save();
            return {
                status: 201,
                message: result,
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
exports.addUser = addUser;
;
function userFindEmail(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield model_1.default.findOne({ email: data.email });
            if (!result) {
                return {
                    status: 200,
                    message: result,
                };
            }
            else {
                return {
                    status: 404,
                    message: null,
                };
            }
        }
        catch (e) {
            console.log("[ERROR] -> userFindEmail", e);
            return {
                status: 400,
                message: "An error occurred while looking the user",
                detail: e,
            };
        }
        ;
    });
}
exports.userFindEmail = userFindEmail;
;
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userFind = yield model_1.default.findOne({ email: email });
            if ((userFind === null || userFind === void 0 ? void 0 : userFind.active) === false) {
                return {
                    status: 404,
                    message: 'User unavailable, concat your administrator'
                };
            }
            if (!userFind) {
                return {
                    status: 404,
                    message: 'User or Password incorrect'
                };
            }
            else {
                const checkPass = yield (0, bcrypt_1.compare)(password, userFind.password);
                if (checkPass) {
                    const user = {
                        id: userFind._id.toString(),
                        name: userFind.name,
                        lastname: userFind.lastname,
                        image: userFind.image || '',
                        email: userFind.email,
                        password: userFind.password,
                        roleId: userFind.roleId.toString()
                    };
                    return {
                        status: 200,
                        user: user
                    };
                }
                else {
                    return {
                        status: 404,
                        message: 'User or Password not exists'
                    };
                }
            }
        }
        catch (e) {
            console.log(e);
            return {
                status: 400,
                message: 'An error occurred while trying to login'
            };
        }
        ;
    });
}
exports.login = login;
;
function updateUser(id, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (userData.password && userData.password.trim() !== '') {
                userData.password = yield (0, bcrypt_1.encrypt)(userData.password);
            }
            else {
                delete userData.password;
            }
            ;
            const user = yield model_1.default.findByIdAndUpdate(id, userData, { new: true });
            if (!user) {
                return {
                    status: 400,
                    message: "User not found"
                };
            }
            return {
                status: 200,
                user: user
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
exports.updateUser = updateUser;
;
function deleteUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundUser = yield model_1.default.findOne({ _id: id });
            if (!foundUser)
                throw new Error('Not user found');
            foundUser.active = false;
            yield foundUser.save();
            return {
                status: 200,
                message: 'User deleted'
            };
        }
        catch (e) {
            console.log("[ERROR] -> addUser", e);
            return {
                status: 400,
                message: "An error occurred while deleting user",
                detail: e,
            };
        }
        ;
    });
}
exports.deleteUser = deleteUser;
;

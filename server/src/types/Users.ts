import { Request } from 'express';

export interface UserType {
   _id?: string;
   id?: string;
   name: string;
   lastname: string;
   image: string;
   email: string;
   password?: string;
   roleId: string;
};

export interface LoginResponse {
   status: number;
   message?: string;
   user?: UserType;
   detail?: any;
};

export interface CustomRequest extends Request {
   user?: UserType;
   token?: string;
   roleId?: string;
}
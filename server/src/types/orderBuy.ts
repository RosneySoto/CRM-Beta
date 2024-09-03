import { Types } from 'mongoose';

export interface OrderBuyType {
   _id?: string;
   nameService: Types.ObjectId | string;
   customerId: Types.ObjectId | string;  // Puedes usar `string` si lo estás trabajando como texto
   vehicleId: Types.ObjectId | string;
   createUserId: Types.ObjectId | string; // o `Types.ObjectId` si usas Mongoose para manejar los IDs.
   createdAt?: Date;
   updatedAt?: Date;
}
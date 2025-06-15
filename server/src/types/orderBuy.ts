import { Types } from 'mongoose';
import mongoose from 'mongoose';

export interface OrderBuyType {
   _id?: string;
   nameService: Types.ObjectId | string;
   price: mongoose.Schema.Types.Decimal128;
   customerId: Types.ObjectId | string;  // Puedes usar `string` si lo estás trabajando como texto
   vehicleId: Types.ObjectId | string;
   createUserId?: Types.ObjectId | string; // o `Types.ObjectId` si usas Mongoose para manejar los IDs.
   createdAt?: Date;
   updatedAt?: Date;
}

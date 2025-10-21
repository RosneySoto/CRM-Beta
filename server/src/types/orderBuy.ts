import { Types } from 'mongoose';
import mongoose from 'mongoose';

export interface OrderBuyType {
   _id?: string;
   nameService: Types.ObjectId | string;
   price: mongoose.Schema.Types.Decimal128;
   customerId: Types.ObjectId | string; 
   vehicleId?: Types.ObjectId | string;
   createUserId?: Types.ObjectId | string;
   createdAt?: Date;
   updatedAt?: Date;
}

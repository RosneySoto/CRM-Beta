import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const orderBuy = new Schema({
   nameService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
   },
   customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customers',
      required: true
   },
   vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
   },
   createUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
   },
   active: {
      type: Boolean,
      default: true
   },
   price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
   },
},
   { timestamps: true}
);

const OrderBuy = mongoose.model("OrderBuy", orderBuy);
export default OrderBuy;

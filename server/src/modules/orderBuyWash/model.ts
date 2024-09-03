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
      require: true
   },
   vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true
   },
   createUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      require: true
   }
},
   { timestamps: true}
);

const OrderBuy = mongoose.model("OrderBuy", orderBuy);
export default OrderBuy;

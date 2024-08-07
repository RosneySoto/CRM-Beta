import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const orderBuy = new Schema({
   nameService: {

   },
   price: {

   },
   customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customers',
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

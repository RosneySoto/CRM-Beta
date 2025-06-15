import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
   //Numero de factura
   //Ej: 00015
   billId: {
      type: Number,
      required: true,
      unique: true
   },
   //Numero completo de la factura
   //Ej: 20250507-00015
   invoiceNumber: {
      type: String,
      required: true,
      unique: true
   },
   orderBuyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderBuy',
      required: true
   },
   paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'TRANSFER'],
      required: true
   },
   amount: {
      type: Number,
      required: true
   },
   paiDate:{
      type: Date,
      default: Date.now
   },
   active:{
      type: Boolean,
      default: true
   }
},
   { timestamps: true }
);

const Payments = mongoose.model("Payments", paymentSchema);
export default Payments;

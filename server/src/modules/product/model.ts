import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const productSchema = new Schema({
   product: {
      type: String,
      required: true
   },
   price: {
      type: Schema.Types.Decimal128,
      required: true
   },
   detail: {
      type: String,
   },
   quantity: {
      type: Number,
      required: true,
      default: 0,
      trim: true
   },
   active: {
      type: Boolean,
      required: true,
      default: true
   }
},
   { timestamps: true }
);

const Products = mongoose.model("Products", productSchema);
export default Products;

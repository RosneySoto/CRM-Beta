import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import { UserRole } from '../../types/Roles';

const rolSchema = new Schema({
   name: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      unique: true,
   },
   description: {
      type: String,
      required: true,
   },
}, 
   { timestamps: true }
);


const Roles = mongoose.model("Roles", rolSchema);
export default Roles;

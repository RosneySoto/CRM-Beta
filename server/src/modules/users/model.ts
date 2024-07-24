import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;

const userSchema = new Schema({
   name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true
   },
   lastname: {
      type: String,
      required: [true, "Please enter your lastname"],
      trim: true
   },
   image:{
      type: String,
      trim: true
   },
   email: {
      type: String,
         trim: true,
         lowercase: true,
         validate: [ validator.isEmail, 'Enter a valid email address.'],
         required: [true, "Please enter your email address"]
   },
   password: {
      type: String,
      required: true,
      trim: true
   },
   active: {
      type: Boolean,
      default: true
   },
   roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roles',
      required: true,
   }
}, 
   { timestamps: true }
);


const Users = mongoose.model("Users", userSchema);
export default Users;

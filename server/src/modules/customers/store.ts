import Customers from './model';
import { CustomerType } from '../../types/Customer';

export async function addCustomer(data: CustomerType) {
   try {
      const newItem = new Customers(data);
      const result = await newItem.save();
      return {
         status: 201,
         message: result
      };
   } catch (e) {
      console.log("[ERROR] -> addUser", e);
      return {
         status: 400,
         message: "An error occurred while creating the user",
         detail: e,
      };
   };
};

export async function findCustomerId(id: string, customerData: CustomerType) {
   try {
      const result = await Customers.findById(id);
      if (!result) {
         return { status: 404, message: 'Customer not found' };
      }

      const data = await Customers.findByIdAndUpdate(id, customerData, { new: true });
      if (!data) {
         return {
            status: 400,
            message: "Error updating customer"
         };
      }
      return {
         status: 200,
         customer: data
      };
   } catch (e) {
      console.log("[ERROR] -> findCustomerId", e);
      return {
         status: 400,
         message: "An error occurred while updating the customer",
         detail: e,
      };
   }
};

export async function deleteCustomer(id: string) {
   try {
      const foundCustomer = await Customers.findOne({ _id: id });
      if(!foundCustomer) throw new Error ('Not customer found');

      foundCustomer.active = false;
      await foundCustomer.save();

      return{
         status: 200,
         message: 'Customer deleted'
      };   
   } catch (e) {
      console.log("[ERROR] -> deleteCustomer", e);
      return {
         status: 400,
         message: "An error occurred while deleting customer",
         detail: e,
      };
   };
};

export async function getAll() {
   try {
      const allcustomer = await Customers.find();
      if(!allcustomer) throw new Error ('No customers found');

      return {
         status: 200,
         message: allcustomer
      }
   } catch (e) {
      console.log("[ERROR] -> getAll", e);
      return {
         status: 400,
         message: "An error occurred while getting all customers",
         detail: e,
      };
   };
};

export async function getAllActive() {
   try {
      const allcustomer = await Customers.find({ active: true });
         
      if (!allcustomer) throw new Error('No active customers found');

      return {
         status: 200,
         message: allcustomer
      }
   } catch (e) {
      console.log("[ERROR] -> getAll", e);
      return {
         status: 400,
         message: "An error occurred while getting all customers",
         detail: e,
      };
   };
};

export async function getByName(name: string) {
   try {
      const regex = new RegExp(`^${name}`, 'i');
      const users = await Customers.find({ name: regex });
      console.log('**** ' + users + '******');
      
      
      // Verificar si se encontraron usuarios
      if (users.length === 0) throw new Error('User not found');
      
      console.log(users);
      return {
         status: 200,
         message: users
      };
   } catch (e) {
      console.log("[ERROR] -> getByName", e);
      return {
         status: 400,
         message: "An error occurred while getting customers by name",
         detail: e,
      };
   }
};


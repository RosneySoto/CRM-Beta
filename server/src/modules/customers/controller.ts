import { addCustomer as _addCustomer,
   findCustomerId as _findCustomerById,
   deleteCustomer as _deleteCustomer,
   getAll as _getAll,
   getAllActive as _getAllActive
} from './store';
import { CustomerType } from '../../types/Customer';
import Customers from './model';

export async function addCustomer(data: CustomerType) {
   try {
      if(data.email === "" || data.numberPhone === null || data.name === "" || data.lastname === "" || !data.email || !data.numberPhone || !data.name || !data.lastname){
         return {
            status: 400,
            message: 'Faltan datos',
         };
      };

      const existingCustomer = await Customers.findOne({email: data.email});
      if (existingCustomer) {
         return {
            status: 401,
            message: 'Email of customer already exists',
         };
      };

      //Valida que la patente exista en la base de datos
      for (const vehicle of data.vehicles) {
         const existingVehicle = await Customers.findOne({ 'vehicles.patente': vehicle.patente });
         if (existingVehicle) {
            return {
               status: 400,
               message: `La patente ${vehicle.patente} ya está registrada`,
            };
         };
      };

      const newCustomer = await _addCustomer(data);
      return {
         status: 201,
         message: data,
      };
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};

export async function updateCustomer(id: string, customerData: CustomerType) {
   try {
      const result = await _findCustomerById(id, customerData);
      if (result.status !== 200) {
         return result;
      }
      return {
         status: 200,
         customer: result.customer,
         message: 'Customer updating correctly'
      };
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};

export async function deleteCustomerPartial(id: string) {
   try {
      const result = await _deleteCustomer(id);
      if(!result){
         return {
            status: 404,
            message: 'Customer not found'
         }
      }
      return result;
   } catch (error) {
      console.log(error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   };
};

export async function getAll() {
   try {
      const result = await _getAll();
      if(!result){
         return {
            status: 404,
            message: 'No customers founds'
         };
      }
      return result;
   } catch (error) {
      console.log(error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   };
};

export async function getAllActive() {
   try {
      const result = await _getAllActive();
            
      if(!result){
         return {
            status: 404,
            message: 'No customers founds'
         };
      }
      return result;
   } catch (error) {
      console.log(error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   };
};

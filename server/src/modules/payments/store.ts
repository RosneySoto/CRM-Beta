import Payments from './model';
import OrderBuy from '../orderBuyWash/model';
// import { PaymentType } from '../../types/Payment';
// import {getOrderById} from '../orderBuyWash/store';
import { getOrderById } from '../orderBuyWash/store'
import Customers from '../customers/model';
import { findCustomerId } from '../customers/store';

export async function findOrderForPay(orderBuyId: string) {
   try {
      // Busca una orden de compra por ID
      const result = await Payments.findById(orderBuyId)
         .populate({
            path: 'orderBuyId',
            populate: [
               { path: 'nameService' },
               { path: 'customerId' },
               { path: 'vehicleId' },
               { path: 'createUserId' }
            ]
         });
      if (!result) {
         return {
            status: 400,
            message: 'Order to pay not found'
         };
      }
      if (result.active === false) {
         return {
            status: 400,
            message: 'The order already paid'
         };
      }
      return result;
   } catch (error) {
      console.log("[ERROR] -> findOrderForPay", error);
      return {
         status: 400,
         message: "An error occurred while searching for the order",
         detail: error
      };
      
   }
};

export async function findOrderBuyById(orderBuyId: string) {
   try {
      const order = await OrderBuy.findById(orderBuyId)
         .populate({
            path: 'nameService',
            select: '-__v -active -createdAt -updatedAt -quantity'
         })
         .populate({
            path: 'customerId',
            select: '-__v -active -createdAt -updatedAt -vehicles'
         })
         .lean();

      if (!order) {
         return { status: 404, message: 'Order not found' };
      }

      if (!order.vehicleId) {
      return { status: 404, message: 'VehicleId not found in order' };
      }
      const dataVehicle = order.vehicleId.toString();
      const customerDataById = order.customerId._id.toString();
      const vehicleResult = await findVehicleInOrder(dataVehicle, customerDataById);

      // Clona el objeto para no mutar el original
      const orderWithVehicle = { ...order };

      // Si el vehículo fue encontrado, lo agregas al resultado
      if (vehicleResult && vehicleResult.status === 200) {
         orderWithVehicle.vehicles = vehicleResult.message;
      }

      const orderFinal = { ...orderWithVehicle };
      delete orderFinal.vehicleId;

      return { status: 200, message: orderFinal };

   } catch (error) {
      return { status: 500, message: 'Error finding order', detail: error };
   }
}

export async function findVehicleInOrder(idVehicle: string, customerId: string) {
   try {
      const customer = await Customers.findById(customerId);
      if(!customer){
         return { status: 404, message: 'Customer not found' };
      }
      
      const vehicle = (customer as any).vehicles.find((v: any) => v.id.toString() === idVehicle);  
         if(!vehicle){
            return { status: 404, message: 'Vehicle not found for this customer' };
         }
         
         return { status: 200, message: vehicle };

   } catch (error) {
      return { status: 500, message: 'Error finding vehicle by id', detail: error };
   }
}
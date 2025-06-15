import Payments from './model';
import OrderBuy from '../orderBuyWash/model'
import { PaymentType } from '../../types/Payment';

export async function findOrderForPay(orderId: string) {
   try {
      const result = await OrderBuy.findById(orderId);      
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
}
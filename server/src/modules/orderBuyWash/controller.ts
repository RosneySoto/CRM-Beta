import { addOrder as _addOrder,
         getAllOrders as _getAllOrders,
         getOrderById as _getOrderById,
         updateOrder as _updateOrder,
         deleteOrderBuy as _deleteOrderBuy
 } from './store';
import { OrderBuyType } from '../../types/orderBuy';

export async function addOrder(data: OrderBuyType) {
   try {
      if(data.nameService === "" || data.customerId === null) {
         return {
            status: 400,
            message: 'Missing data'
         };
      };

      const newOrderBuy = await _addOrder(data);
      return {
         status: 201,
         message: newOrderBuy
      }; 
   } catch (error) {
      console.error('Unexpected Controller Error', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   };
};

export async function getAllOrders() {
   try {
      const result = await _getAllOrders();
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
   }
};

export async function getOrderById(id: string) {
   try {
      const result = await _getOrderById(id);
      if(!result){
         return {
            status: 404,
            message: 'Order not found'
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

export async function updateOrder(id: string, data: OrderBuyType) {
   try {
      const result = await _updateOrder(id, data);

      if(!result){
         return {
            status: 404,
            message: 'Order not found'
         };
      }
      return result;
   } catch (error) {
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   }
};

export async function deleteOrderBuyPartial(id: string) {
   try {
      const result = await _deleteOrderBuy(id);
      if(!result){
         return {
            status: 404,
            message: 'Order buy not found'
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

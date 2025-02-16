import customerModel from '../customers/model';
import userModel from '../users/model';
import OrderBuy from './model';
import Customer from '../customers/model';
import { OrderBuyType } from '../../types/orderBuy';

// store.ts
export async function addOrder(orderData: OrderBuyType) {
   try {
      // Verifica la existencia del cliente y el vehículo
      const customer = await Customer.findById(orderData.customerId);
      if (!customer) {
         throw new Error('Customer not found');
      }

      const vehicleExists = customer.vehicles.some(vehicle => vehicle.id.toString() === orderData.vehicleId);
      if (!vehicleExists) {
         throw new Error('Vehicle not found for this customer');
      }

      // Crea la nueva orden
      const newOrder = new OrderBuy({
         nameService: orderData.nameService,
         customerId: orderData.customerId,
         vehicleId: orderData.vehicleId,
         createUserId: orderData.createUserId, // Guarda el ID del usuario que crea la orden
      });
      console.log('newOrder', newOrder);

      await newOrder.save();

      return {
         status: 201,
         message: 'Order created successfully',
         data: newOrder,
      };
   } catch (error) {
      return {
         status: 400,
         message: error,
      };
   }
};

export async function getAllOrders() {
   try {
      // Encontrar todas las órdenes de compra
      const orders = await OrderBuy.find()
         .populate({ path:'customerId',
                     select: 'name lastname email' })
         .populate({ path: 'vehicleId' })
         .populate({ path: 'nameService', 
                     select: 'product price' })
         .populate({ path: 'createUserId', 
                     select: 'name email'});

      // Si no se encuentran órdenes, lanzar un error
      if (!orders) throw new Error('No orders found');

      // Mapeo de las órdenes para incluir el vehículo específico
      const populatedOrders = await Promise.all(
         orders.map(async (order) => {

            const customer = await Customer.findById(order.customerId);
            
            const vehicle = customer?.vehicles.find(
               (v) => v.id.toString() === order.vehicleId?.toString()
            );

            return {
               ...order.toObject(),
               vehicle,
            };
         })
      );

      return {
         status: 200,
         message: populatedOrders,
      };
   } catch (e) {
      console.log('[ERROR] -> getAllOrders', e);
      return {
         status: 400,
         message: 'An error occurred while getting all orders',
         detail: e,
      };
   }
};

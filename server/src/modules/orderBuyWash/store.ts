import customerModel from '../customers/model';
import userModel from '../users/model';
import OrderBuy from './model';
import Customer from '../customers/model';
import { OrderBuyType } from '../../types/orderBuy';

// export async function addOrder(data: OrderBuyType) {
//    try {
//       const newItem = new OrderBuy(data);
//       const result = await newItem.save();
//       return {
//          status: 201,
//          message: result
//       };
//    } catch (error) {
//       console.log("[ERROR] -> addOrder", error);
//       return {
//          status: 400,
//          message: "An error occurred while creating the order",
//          detail: error
//       };
//    };
// };

// export async function getAllOrder() {
//    try {
//       const allOrder = await OrderBuy.find()
//          .populate({
//             path: 'customerId',
//             select: 'name lastname vehicles._id'
//          })

//       if(!allOrder) throw new Error ('No orders found');

//       return {
//          status: 200,
//          message: allOrder
//       };
//    } catch (e) {
//       console.log("[ERROR] -> getAll", e);
//       return {
//          status: 400,
//          message: "An error occurred while getting all customers",
//          detail: e,
//       };
//    }
// }

export async function addOrder(orderData: OrderBuyType) {
   try {
      // Primero, verifica si el cliente existe
      const customer = await Customer.findById(orderData.customerId);
      if (!customer) {
         throw new Error('Customer not found');
      }

      // Verifica si el vehículo pertenece al cliente
      const vehicleExists = customer.vehicles.some(vehicle => vehicle.id.toString() === orderData.vehicleId);
      if (!vehicleExists) {
         throw new Error('Vehicle not found for this customer');
      }

      // Crea la orden de compra
      const newOrder = new OrderBuy({
         nameService: orderData.nameService,
         customerId: orderData.customerId,
         vehicleId: orderData.vehicleId,
         createUserId: orderData.createUserId,
      });

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
}

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
}

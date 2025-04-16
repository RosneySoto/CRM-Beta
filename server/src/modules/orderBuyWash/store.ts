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

export async function getOrderById(orderId: string) {
   try {      
      const orderData = await OrderBuy.findById(orderId)
         .populate({ path: 'customerId', select: 'name lastname email vehicles' }) // Traer `vehicles`
         .populate({ path: 'nameService', select: 'product price' })
         .populate({ path: 'createUserId', select: 'name email' })
         .lean(); // Convertir a objeto JSON puro

      if (!orderData) {
         throw new Error('Order not found');
      };
      // Convertir `customerId` en un objeto con tipado correcto
      const customer = orderData.customerId as unknown as { 
         _id: string; 
         name: string; 
         lastname: string; 
         email: string; 
         vehicles?: { _id: string; marca: string; modelo: string; patente: string }[];
      };

      // Buscar el vehículo específico dentro del array de `vehicles`
      const vehicle = customer.vehicles?.find((v) => v._id.toString() === orderData.vehicleId?.toString());

      if (!vehicle) {
         throw new Error('Vehicle not found for this order');
      };

      // Eliminar `vehicles` del objeto `customerId` para que no se muestre en la respuesta
      delete (customer as any).vehicles;

      // Crear resultado final con solo el vehículo asociado
      const result = {
         ...orderData,
         customerId: customer, // Ahora sin `vehicles`
         vehicle, // Solo el vehículo asociado a la orden
      };
      delete result.vehicleId; // Eliminar `vehicleId` para evitar duplicados

      return {
         status: 200,
         message: result,
      };
   } catch (error) {
      return {
         status: 400,
         message: error,
      };
   };
};

export async function updateOrder(orderId: string, orderData: OrderBuyType) {
   try {
      // Verificar la existencia de la orden
      const order = await getOrderById(orderId);
      if(!order) throw new Error('Order not found');

      // Actualizar la orden
      const updatedOrder = await OrderBuy.findByIdAndUpdate(orderId, orderData, { new: true });

      if(!updatedOrder) throw new Error('Error updating order');

      return {
         status: 200,
         message: 'Order updated successfully',
         data: updatedOrder,
      };
   } catch (error) {
      return {
         status: 400,
         message: error,
      };
   };
};

export async function deleteOrderBuy(id: string) {
   try {
      const foundOrder = await OrderBuy.findOne({ _id: id });
      if(!foundOrder) throw new Error ('Not order buy found');

      foundOrder.active = false;
      await foundOrder.save();

      return{
         status: 200,
         message: 'The order was deleted'
      };   
   } catch (e) {
      console.log("[ERROR] -> deleteOrderBuy", e);
      return {
         status: 400,
         message: "An error occurred while deleting order",
         detail: e,
      };
   };
};
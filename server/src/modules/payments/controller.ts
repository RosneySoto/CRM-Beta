import { findOrderForPay } from './store';
import { PaymentType } from '../../types/Payment';
import Payments from './model';
import { generarBillId, generarInvoiceNumber } from '../../utils/bill'
import { findOrderBuyById } from './store';
import mongoose from 'mongoose';

// export async function findOrderByIdandCreateBill(orderBuyId: string, paymentMethod: string) {
//    try {
//       const order = await findOrderBuyById(orderBuyId);      
//       if(!order ||
//          order.status !== 200 ||
//          typeof order.message !== 'object' ||
//          order.message === null) {
//          return {
//             status: 404,
//             message: 'Order not found',
//          };
//       }
//       const billId = await generarBillId();
//       const invoiceNumber = generarInvoiceNumber(billId);
//       const payment = paymentMethod;
      
//       const priceRaw = (order.message as any).nameService?.price;
//       const amount =
//          typeof priceRaw === 'object' && typeof priceRaw.toString === 'function'
//             ? parseFloat(priceRaw.toString())
//             : Number(priceRaw);

//       const facturaPreview = {
//          ...order.message,
//          billId,
//          invoiceNumber,
//          payment,
//          amount,
//          paiDate: new Date(),
//       };
      
      
//       return {
//          status: 200,
//          message: facturaPreview,
//       };
//    } catch (error) {
//       console.error('Unexpected Controller Error:', error);
//       return {
//          status: 500,
//          message: 'Unexpected Controller Error',
//          detail: error,
//       };
//    }
// }

export async function findOrderByIdandCreateBill(orderBuyId: string, paymentMethod: string) {
   try {
      const order = await findOrderBuyById(orderBuyId);

      if(!order ||
         order.status !== 200 ||
         typeof order.message !== 'object' ||
         order.message === null) {
         return {
            status: 404,
            message: 'Order not found',
         };
      }

      const billId = await generarBillId();
      const invoiceNumber = generarInvoiceNumber(billId);

      // Extrae solo los IDs (si son objetos, toma el _id)
      const orderData = order.message as any;

      const facturaData = {
         orderBuyId: orderData._id,
         billId,
         invoiceNumber,
         nameService: typeof orderData.nameService === 'object' ? orderData.nameService._id : orderData.nameService,
         customerId: typeof orderData.customerId === 'object' ? orderData.customerId._id : orderData.customerId,
         vehicleId: orderData.vehicleId, // ya es un ID
         createUserId: orderData.createUserId?._id || orderData.createUserId,
         paymentMethod,
         amount: (() => {
            const priceRaw = orderData.nameService?.price;
            if (priceRaw && typeof priceRaw === 'object' && typeof priceRaw.toString === 'function') {
               return parseFloat(priceRaw.toString());
            }
            return Number(priceRaw);
         })(),
         paiDate: new Date(),
         active: true
      };

      // Guarda la factura en la base de datos
      const facturaGuardada = await Payments.create(facturaData);

      return {
         status: 200,
         message: facturaGuardada,
      };
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   }
}

export async function createBill(orderBuyId: string, paymentMethod: string, amount: number) {
   try {
      const billId = await generarBillId();
      const invoiceNumber = generarInvoiceNumber(billId);

      const nuevaFactura = new Payments({
         billId,
         invoiceNumber,
         orderBuyId,
         paymentMethod,
         amount,
         paiDate: new Date()
      });

      const facturaGuardada = await nuevaFactura.save();
      return facturaGuardada;

   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };

   }
};


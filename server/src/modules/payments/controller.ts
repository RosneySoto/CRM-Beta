import { findOrderForPay } from './store';
import { PaymentType } from '../../types/Payment';
import Payments from './model';

export async function generateBill(data: PaymentType) {
   try {
      const orderBuyFound = await findOrderForPay(data.orderBuyId);      

      // Si findOrderForPay devuelve un objeto con mensaje, es un error
      if (!orderBuyFound || (orderBuyFound as any).message) {
         return {
            status: 400,
            message: (orderBuyFound as any).message || 'Unexpected Error, please try again',
         };
      }
      // buscar primero pro ID
      // ver que trae
      // mapear y mostrar todos los dtos de la orden de compra
      // meterlo en un objeto nuevo
      // generar la factura
      // guardar la factura    

      return {
         status: 200,
         message: orderBuyFound
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

async function generarBillId(): Promise<number> {
   const ultimaFactura = await Payments.findOne().sort({ billId: -1 });
   return ultimaFactura ? ultimaFactura.billId + 1 : 1;
}

function generarInvoiceNumber(billId: number): string {
   const fechaStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Ej: "20250507"
   return `${fechaStr}-${billId.toString().padStart(5, '0')}`;               // Ej: "20250507-00015"
}

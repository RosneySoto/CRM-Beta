import Payments from '../modules/payments/model';

export async function generarBillId(): Promise<number> {
   const ultimaFactura = await Payments.findOne().sort({ billId: -1 });
   return ultimaFactura ? ultimaFactura.billId + 1 : 1;
 }
 
 export function generarInvoiceNumber(billId: number): string {
   const fechaStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Ej: "20250507"
   return `${fechaStr}-${billId.toString().padStart(5, '0')}`;               // Ej: "20250507-00015"
 }
 
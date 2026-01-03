import { findOrderForPay } from './store';
import { PaymentType } from '../../types/Payment';
import Payments from './model';
import { generarBillId, generarInvoiceNumber } from '../../utils/bill'
import { findOrderBuyById } from './store';
import { sendInvoiceByPaymentId, generateInvoiceHTML, InvoiceData } from '../../utils/email';
import { generateInvoicePDF } from '../../utils/pdf';
import mongoose from 'mongoose';

export async function findOrderByIdandCreateBill(orderBuyId: string, paymentMethod: string, sendEmail: boolean = false, generatePDF: boolean = false) {
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

      // Actualizar el estado de la orden a inactiva (ya cobrada)
      const OrderBuy = (await import('../orderBuyWash/model')).default;
      await OrderBuy.findByIdAndUpdate(orderBuyId, { active: false });

      // Si se solicita envío por email, intentar enviar la factura
      let emailResult = null;
      if (sendEmail) {
         try {
            const emailResponse = await sendInvoiceByPaymentId(facturaGuardada._id.toString());
            emailResult = {
               emailSent: emailResponse.success,
               emailMessage: emailResponse.message
            };
         } catch (emailError) {
            console.error('Error enviando email:', emailError);
            emailResult = {
               emailSent: false,
               emailMessage: 'Error al enviar el email'
            };
         }
      }

      // Si se solicita generar PDF, crear los datos de la factura y generar PDF
      let pdfResult = null;
      let pdfBuffer = null;

      if (generatePDF) {
         try {
            // Preparar datos para generar la factura
            const invoiceData: InvoiceData = {
               invoiceNumber: facturaGuardada.invoiceNumber,
               billId: facturaGuardada.billId,
               customerName: orderData.customerId?.name || 'Cliente',
               customerLastname: orderData.customerId?.lastname || 'Desconocido',
               serviceName: typeof orderData.nameService === 'object' ? (orderData.nameService as any)?.product || 'Servicio de lavado' : 'Servicio de lavado',
               vehicleInfo: orderData.vehicleId ? {
                  marca: (orderData.vehicleId as any)?.marca || '',
                  modelo: (orderData.vehicleId as any)?.modelo || '',
                  patente: (orderData.vehicleId as any)?.patente || '',
               } : undefined,
               amount: facturaGuardada.amount,
               paymentMethod: facturaGuardada.paymentMethod,
               paymentDate: facturaGuardada.paiDate,
            };

            pdfBuffer = await generateInvoicePDF(invoiceData);
            pdfResult = {
               pdfGenerated: true,
               pdfSize: pdfBuffer.length,
               message: 'PDF generado exitosamente'
            };
         } catch (pdfError) {
            console.error('Error generando PDF:', pdfError);
            pdfResult = {
               pdfGenerated: false,
               message: 'Error al generar el PDF'
            };
         }
      }

      // Si se generó PDF exitosamente, devolver el PDF directamente
      if (pdfBuffer && pdfResult?.pdfGenerated) {
         return {
            status: 200,
            message: {
               ...facturaGuardada.toObject(),
               emailResult: emailResult,
               pdfResult: pdfResult
            },
            pdfBuffer: pdfBuffer,
            downloadPdf: true
         };
      }

      return {
         status: 200,
         message: {
            ...facturaGuardada.toObject(),
            emailResult: emailResult,
            pdfResult: pdfResult
         },
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


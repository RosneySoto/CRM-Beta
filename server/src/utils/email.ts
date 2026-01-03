import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/Emails';
import { generateInvoicePDF } from './pdf';

// Configuración del transporter de email
const createTransporter = () => {
   return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
   });
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
   try {
      const transporter = createTransporter();

      // Verificar conexión
      await transporter.verify();

      const mailOptions: any = {
         from: `"Car Wash System" <${process.env.EMAIL_USER}>`,
         to: options.to,
         subject: options.subject,
         html: options.html,
      };

      // Agregar adjuntos si existen
      if (options.attachments && options.attachments.length > 0) {
         mailOptions.attachments = options.attachments.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
         }));
      }

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return true;
   } catch (error) {
      console.error('Error enviando email:', error);
      return false;
   }
};

export interface InvoiceData {
   invoiceNumber: string;
   billId: number;
   customerName: string;
   customerLastname: string;
   serviceName: string;
   vehicleInfo?: {
      marca: string;
      modelo: string;
      patente: string;
   };
   amount: number;
   paymentMethod: string;
   paymentDate: Date;
}

export const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
   const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('es-AR', {
         style: 'currency',
         currency: 'ARS',
      }).format(amount);
   };

   const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat('es-AR', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      }).format(new Date(date));
   };

   return `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CAR WASH SYSTEM</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Factura de Servicio</p>
      </div>

      <!-- Invoice Details -->
      <div style="padding: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="margin: 0 0 10px 0; color: #333;">Factura #${invoiceData.invoiceNumber}</h3>
            <p style="margin: 0; color: #666;">ID Interno: ${invoiceData.billId.toString().padStart(5, '0')}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #666;">Fecha de emisión:</p>
            <p style="margin: 0; font-weight: bold;">${formatDate(invoiceData.paymentDate)}</p>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h4 style="margin: 0 0 15px 0; color: #333;">Información del Cliente</h4>
          <p style="margin: 5px 0;"><strong>Nombre:</strong> ${invoiceData.customerName} ${invoiceData.customerLastname}</p>
          ${invoiceData.vehicleInfo ? `
            <p style="margin: 5px 0;"><strong>Vehículo:</strong> ${invoiceData.vehicleInfo.marca} ${invoiceData.vehicleInfo.modelo}</p>
            <p style="margin: 5px 0;"><strong>Patente:</strong> ${invoiceData.vehicleInfo.patente}</p>
          ` : ''}
        </div>

        <!-- Service Details -->
        <div style="margin-bottom: 30px;">
          <h4 style="margin: 0 0 15px 0; color: #333;">Detalle del Servicio</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Servicio</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Método de Pago</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${invoiceData.serviceName}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${invoiceData.paymentMethod === 'CASH' ? 'Efectivo' : invoiceData.paymentMethod === 'CARD' ? 'Tarjeta' : 'Transferencia'}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold; color: #28a745;">${formatCurrency(invoiceData.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">Total a Pagar:</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #28a745;">${formatCurrency(invoiceData.amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0;">Gracias por elegir nuestros servicios</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Esta es una factura electrónica generada automáticamente</p>
        </div>
      </div>
    </div>
  `;
};

export const sendInvoiceByEmail = async (
   customerEmail: string,
   customerName: string,
   invoiceNumber: string,
   invoiceHtml: string,
   pdfBuffer?: Buffer
): Promise<boolean> => {
   const subject = `Factura ${invoiceNumber} - Car Wash System`;

   const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Factura de Servicio</h2>
      <p>Hola ${customerName},</p>
      <p>Adjunto encontrarás la factura correspondiente a tu servicio de lavado de vehículo.</p>

      <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        ${invoiceHtml}
      </div>

      <p>Gracias por elegir nuestros servicios.</p>
      <p>Saludos,<br>Equipo Car Wash System</p>
    </div>
  `;

   const emailOptions: any = {
      to: customerEmail,
      subject,
      html,
   };

   // Si se proporciona PDF, agregarlo como adjunto
   if (pdfBuffer) {
      emailOptions.attachments = [{
         filename: `Factura_${invoiceNumber}.pdf`,
         content: pdfBuffer,
         contentType: 'application/pdf',
      }];
   }

   return await sendEmail(emailOptions);
};

// Función para enviar factura por email usando datos de la base de datos
export const sendInvoiceByPaymentId = async (paymentId: string): Promise<{ success: boolean; message: string }> => {
   try {
      // Importar modelos necesarios
      const Payments = (await import('../modules/payments/model')).default;
      const Customers = (await import('../modules/customers/model')).default;
      const OrderBuy = (await import('../modules/orderBuyWash/model')).default;
      const Product = (await import('../modules/product/model')).default;

      // Buscar el pago con toda la información relacionada
      const payment = await Payments.findById(paymentId)
         .populate({
            path: 'orderBuyId',
            populate: [
               { path: 'customerId', select: 'name lastname email' },
               { path: 'nameService', select: 'product' },
               { path: 'vehicleId', select: 'marca modelo patente' }
            ]
         });

      if (!payment) {
         return { success: false, message: 'Factura no encontrada' };
      }

      const order = payment.orderBuyId as any;
      if (!order || !order.customerId || !order.customerId.email) {
         return { success: false, message: 'Información del cliente o email no disponible' };
      }

      // Preparar datos para generar la factura
      const invoiceData: InvoiceData = {
         invoiceNumber: payment.invoiceNumber,
         billId: payment.billId,
         customerName: order.customerId.name,
         customerLastname: order.customerId.lastname,
         serviceName: order.nameService?.product || 'Servicio de lavado',
         vehicleInfo: order.vehicleId ? {
            marca: order.vehicleId.marca,
            modelo: order.vehicleId.modelo,
            patente: order.vehicleId.patente,
         } : undefined,
         amount: payment.amount,
         paymentMethod: payment.paymentMethod,
         paymentDate: payment.paiDate,
      };

      // Generar HTML de la factura
      const invoiceHtml = generateInvoiceHTML(invoiceData);

      // Generar PDF de la factura para adjuntar
      let pdfBuffer: Buffer | undefined;
      try {
         pdfBuffer = await generateInvoicePDF(invoiceData);
      } catch (pdfError) {
         console.warn('No se pudo generar PDF para adjuntar al email:', pdfError);
         // Continuar sin PDF, enviar solo HTML
      }

      // Enviar email con factura adjunta (PDF si se generó correctamente)
      const emailSent = await sendInvoiceByEmail(
         order.customerId.email,
         `${order.customerId.name} ${order.customerId.lastname}`,
         payment.invoiceNumber,
         invoiceHtml,
         pdfBuffer
      );

      if (emailSent) {
         return { success: true, message: 'Factura enviada exitosamente por email' };
      } else {
         return { success: false, message: 'Error al enviar el email' };
      }

   } catch (error) {
      console.error('Error enviando factura por email:', error);
      return { success: false, message: 'Error interno del servidor' };
   }
};

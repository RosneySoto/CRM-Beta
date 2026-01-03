import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
import { findOrderByIdandCreateBill } from './controller';
import { sendInvoiceByPaymentId } from '../../utils/email';
import { generateInvoicePDFByPaymentId } from '../../utils/pdf';
import Payments from './model';
import OrderBuy from '../orderBuyWash/model';
import { CustomRequest } from '../../types/Users'
const router = express.Router();

router.post('/:id', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {

   const {id} = req.params;
   const { paymentMethod, sendEmail = false, generatePDF = false } = req.body;

   if (!paymentMethod || (paymentMethod !== 'CASH' && paymentMethod !== 'CARD' && paymentMethod !== 'TRANSFER')) {
      return res.status(400).json({
         status_code: 400,
         message: 'Debe indicar un metodo de pago correcto'
      });
   }

   findOrderByIdandCreateBill(id as string, paymentMethod as string, sendEmail as boolean, generatePDF as boolean)
      .then((data) => {
         switch (data.status) {
            case 200:
               // Si hay PDF para descargar, enviarlo como archivo
               if (data.pdfBuffer && data.downloadPdf) {
                  const invoiceNumber = data.message.invoiceNumber || `Factura_${Date.now()}`;
                  const fileName = `Factura_${invoiceNumber}.pdf`;

                  res.setHeader('Content-Type', 'application/pdf');
                  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                  res.setHeader('Content-Length', data.pdfBuffer.length);
                  res.send(data.pdfBuffer);
               } else {
                  res.status(200).json(data.message);
               }
               break;
            case 400:
               res.status(400).json(data.message);
               break;
            case 420:
               res.status(420).json(data.message);
               break;
            default:
               controllerError(data, req, res);
               break
         }
      })
      .catch((e) => {
         console.log(e);
         res.status(500).send('Unexpected Error');
      });
});

// Endpoint para enviar factura por email
router.post('/:id/send-email', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {
   const { id } = req.params;

   try {
      // Verificar que la factura existe
      const payment = await Payments.findById(id);
      if (!payment) {
         return res.status(404).json({
            status_code: 404,
            message: 'Factura no encontrada'
         });
      }

      // Enviar la factura por email
      const emailResult = await sendInvoiceByPaymentId(id);

      res.status(emailResult.success ? 200 : 500).json({
         status_code: emailResult.success ? 200 : 500,
         message: emailResult.message,
         success: emailResult.success
      });

   } catch (error) {
      console.error('Error en endpoint send-email:', error);
      res.status(500).json({
         status_code: 500,
         message: 'Error interno del servidor',
         success: false
      });
   }
});

// Endpoint para descargar factura como PDF
router.get('/:id/pdf', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {
   const { id } = req.params;

   try {
      // Verificar que la factura existe
      const payment = await Payments.findById(id);
      if (!payment) {
         return res.status(404).json({
            status_code: 404,
            message: 'Factura no encontrada'
         });
      }

      // Generar PDF
      const pdfResult = await generateInvoicePDFByPaymentId(id);

      if (!pdfResult.success || !pdfResult.pdf) {
         return res.status(500).json({
            status_code: 500,
            message: pdfResult.message,
            success: false
         });
      }

      // Configurar headers para descarga
      const fileName = `Factura_${payment.invoiceNumber}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfResult.pdf.length);

      // Enviar el PDF
      res.send(pdfResult.pdf);

   } catch (error) {
      console.error('Error en endpoint PDF:', error);
      res.status(500).json({
         status_code: 500,
         message: 'Error interno del servidor',
         success: false
      });
   }
});

router.get('/dashboard/sales', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req, res) => {
   try {
      // 1. Obtener todas las ventas/pagos completados (ingresos)
      const sales = await Payments.find({ active: true })
         .populate({
            path: 'orderBuyId',
            select: 'customerId nameService' // Solo seleccionar las referencias
         })
         .sort({ createdAt: -1 });

      await Payments.populate(sales, {
         path: 'orderBuyId.customerId',
         select: 'name lastname'
      });

      await Payments.populate(sales, {
         path: 'orderBuyId.nameService', 
         select: 'product'
      });

      // 2. Obtener todas las órdenes (pagadas y no pagadas)
      const allOrders = await OrderBuy.find({})
         .populate({ path: 'customerId', select: 'name lastname' })
         .sort({ createdAt: -1 });

      // 3. Calcular métricas principales
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalOrders = allOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // 4. Obtener clientes únicos (todos los que tienen órdenes)
      const uniqueCustomers = new Set();
      allOrders.forEach(order => {
         if (order.customerId && order.customerId._id) {
            uniqueCustomers.add(order.customerId._id.toString());
         }
      });
      const totalCustomers = uniqueCustomers.size;

      // 5. Formatear datos de ventas para gráficos
      const salesData = sales.map(sale => ({
         id: sale._id,
         date: sale.createdAt,
         amount: sale.amount,
         product: sale.orderBuyId?.nameService?.product || 'Producto desconocido',
         customer: `${sale.orderBuyId?.customerId?.name || 'Cliente'} ${sale.orderBuyId?.customerId?.lastname || 'desconocido'}`,
         paymentMethod: sale.paymentMethod,
         orderId: sale.orderBuyId?._id
      }));

      // 6. Formatear datos de órdenes para cálculos adicionales
      const ordersData = allOrders.map(order => ({
         id: order._id,
         date: order.createdAt,
         price: parseFloat(order.price?.$numberDecimal || order.price || 0),
         product: order.nameService?.product || 'Producto desconocido',
         customer: `${order.customerId?.name || 'Cliente'} ${order.customerId?.lastname || 'desconocido'}`,
         customerId: order.customerId?._id,
         active: order.active, // true = no pagada, false = pagada
         paid: !order.active // true = pagada, false = no pagada
      }));

      // 7. Devolver respuesta completa
      const dashboardData = {
         // Métricas principales
         summary: {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOrders,
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
            totalCustomers
         },
         
         // Datos para gráficos
         sales: salesData, // Solo ventas pagadas
         orders: ordersData, // Todas las órdenes
         
         // Información adicional
         metadata: {
            salesCount: sales.length,
            ordersCount: allOrders.length,
            dateRange: {
               oldest: allOrders.length > 0 ? allOrders[allOrders.length - 1].createdAt : null,
               newest: allOrders.length > 0 ? allOrders[0].createdAt : null
            }
         }
      };

      res.json(dashboardData);
   } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ 
         error: 'Error al obtener datos del dashboard',
         details: error.message 
      });
   }
});

export default router;
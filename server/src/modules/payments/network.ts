import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
import { findOrderByIdandCreateBill } from './controller';
import Payments from './model';
import OrderBuy from '../orderBuyWash/model'; // Importar modelo de órdenes
// import { PaymentType } from '../../types/Payment'
import { CustomRequest } from '../../types/Users'
const router = express.Router();

import {findOrderBuyById} from './store'

router.post('/:id', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {

   const {id} = req.params;
   const { paymentMethod } = req.body;

   if (!paymentMethod || (paymentMethod !== 'CASH' && paymentMethod !== 'CARD' && paymentMethod !== 'TRANSFER')) {
      return res.status(400).json({
         status_code: 400,
         message: 'Debe indicar un metodo de pago correcto'
      });
   }

   findOrderByIdandCreateBill(id as string, paymentMethod as string)
      .then((data) => {
         switch (data.status) {
            case 200:
               res.status(200).send(data.message);
               break;
            case 400:
               res.status(400).send(data.message);
               break;
               case 420:
               res.status(420).send(data.message);
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

// En routes/payments.js o donde manejes las rutas de pagos
router.get('/dashboard/sales', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req, res) => {
   try {
      // 1. Obtener todas las ventas/pagos completados (ingresos)
      // CAMBIAR: Usar populate anidado correctamente
      const sales = await Payments.find({ active: true })
         .populate({
            path: 'orderBuyId',
            populate: [
               { path: 'customerId', select: 'name lastname' },
               { path: 'nameService', select: 'product' }
            ]
         })
         .sort({ createdAt: -1 });

      // QUITAR estos populate separados incorrectos
      // await Payments.populate(sales, {...});
      // await Payments.populate(sales, {...});

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
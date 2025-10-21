import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
import { addOrder, getAllOrders, getOrderById, updateOrder, deleteOrderBuyPartial } from './controller';
import { CustomRequest } from '../../types/Users'
const router = express.Router();

//Crea una orden de compra
router.post('/', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {
   // Asegurar que req.user está presente
   if (!req.user || !req.user.id) {
      return res.status(401).send('Unauthorized: No user ID found');
   }
   // Modifica los datos para incluir el createUserId desde el token
   const orderData = {
      ...req.body,
      createUserId: req.user.id
   };
   addOrder(orderData)
      .then((data) => {
         switch (data.status) {
            case 201:
               res.status(201).send(data.message);
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

//Muestra todas las ordenes de compra
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
   getAllOrders()
      .then((data) => {
         switch(data.status){
            case 200:
               res.status(200).send(data.message);
               break;
            case 400:
               res.status(data.status).send(data.message);
               break;
         }
      })
      .catch((e) => {
         console.log(e);
         res.status(500).send('Unexpected Error');
      });
});

router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
   const { id } = req.params;
   
   getOrderById(id)
      .then((data) => {
         switch(data.status){
            case 200:
               res.status(200).send(data.message);
               break;
            case 404:
               res.status(data.status).send(data.message);
               break;
            default:
               controllerError(data, req, res);
               break;
         }
      })
      .catch((e) => {
         console.log(e);
         res.status(500).send('Unexpected Error');
      });
});

router.patch('/update/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
   const { id } = req.params;
   const orderData = req.body; 
   
   updateOrder(id, orderData)
      .then((data) => {
         switch(data.status){
            case 200:
               res.status(200).send(data.message);
               break;
            case 404:
               res.status(data.status).send(data.message);
               break;
            default:
               controllerError(data, req, res);
               break;
         }
      })
      .catch((e) => {
         console.log(e);
         res.status(500).send('Unexpected Error');
      });
});

router.delete('/delete/:id', authenticate, authorize([UserRole.Admin]), async (req: CustomRequest, res: Response, next: NextFunction) =>{
   deleteOrderBuyPartial(req.params.id)
      .then((data) => {
         switch(data.status){
            case 200:
               res.status(200).send(`Order Buy ${req.params.id} deleted`);
               break;
            case 400:
               res.status(data.status).send(data.message);
               break;
         };
      })
      .catch((e) => {
         console.log(e);
         res.status(500).send('Unexpected Error');
      });
});

export default router;


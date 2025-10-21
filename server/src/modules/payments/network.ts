import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
import { findOrderByIdandCreateBill } from './controller';
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

// router.get('/:id', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {

//    const {id} = req.params;
//    findBillById(id)
//       .then((data) => {
//          switch (data.status) {
//             case 200:
//                res.status(200).send(data.message);
//                break;
//             case 400:
//                res.status(400).send(data.message);
//                break;
//                case 420:
//                res.status(420).send(data.message);
//                break;
//             default:
//                controllerError(data, req, res);
//                break
//          }
//       })
//       .catch((e) => {
//          console.log(e);
//          res.status(500).send('Unexpected Error');
//       });
// });

export default router;
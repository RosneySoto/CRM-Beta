import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
import { paymentController } from './controller';
import { PaymentType } from '../../types/Payment'
import { CustomRequest } from '../../types/Users'
const router = express.Router();

router.post('/', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {

   const orderBuyId = req.body;
   paymentController(orderBuyId)
      .then((data) => {
         switch (data.status) {
            case 200:
               res.status(200).send(data.message);
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

export default router;
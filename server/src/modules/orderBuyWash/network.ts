import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
import { addOrder, getAllOrders } from './controller';
const router = express.Router();

router.post('/', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: Request, res: Response, next: NextFunction) => {
   addOrder(req.body)
      .then((data) => {
         switch(data.status){
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

export default router;


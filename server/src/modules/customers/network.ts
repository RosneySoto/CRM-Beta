import express, { Request, Response, NextFunction } from 'express';
import controllerError  from '../../middleware/controllerError';
import { addCustomer, updateCustomer, deleteCustomerPartial, getAll, getAllActive } from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { CustomRequest } from '../../types/Users'
import { UserRole } from '../../types/Roles'
const router = express.Router();

router.post('/', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: Request, res: Response, next: NextFunction) => {
   addCustomer(req.body)
      .then((data) =>{
         switch (data.status){
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

router.put('/edit/:id', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) => {
   const userId = req.user?.id;

   if (!userId) {
      return res.status(401).send('No estás autorizado');
   }

   const customerId = req.params.id;
   const customerData = req.body;

   updateCustomer(customerId, customerData)
      .then((data) => {
         switch (data.status) {
            case 200:
               res.status(200).send(data.customer);
               break;
            case 404:
               res.status(404).send(data.message);
               break;
            case 400:
               res.status(400).send(data.message);
               break;
            case 403:
               res.status(403).send(data.message);
               break;
            default:
               controllerError(data, req, res);
               break;
         }
      })
      .catch((error) => {
         console.error('Error al actualizar el cliente:', error);
         res.status(500).send('Error al actualizar el cliente');
      });
});

router.delete('/:id', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: CustomRequest, res: Response, next: NextFunction) =>{
   deleteCustomerPartial(req.params.id)
      .then((data) => {
         switch(data.status){
            case 200:
               res.status(200).send(`Customer ${req.params.id} deleted`);
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

router.get('/', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
   getAll()
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

router.get('/all', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
   getAllActive()
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
})

export default router;

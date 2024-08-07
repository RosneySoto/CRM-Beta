import express, {Request, Response, NextFunction} from "express";
import controllerError from '../../middleware/controllerError';
import { addProduct, findProductById, updateProduct, deleteProduct } from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from "../../types/Roles";
const router = express.Router();

router.post('/', authenticate, authorize([UserRole.Admin, UserRole.User]), async (req: Request, res: Response, next: NextFunction) => {
   addProduct(req.body)
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

router.get('/:id', authenticate, authorize([UserRole.Admin, UserRole.User
]), async (req: Request, res: Response, next: NextFunction) => {
   findProductById(req.params.id)
   .then((data) =>{
      switch (data.status){
         case 200:
            res.status(201).send(data.message);
            break;
         case 400:
            res.status(400).send(data.message);
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

router.put('/update', authenticate, async (req: Request, res: Response, next: NextFunction) => {
   const idProduct = req.body.id;
   const productData = req.body;

   if(!idProduct) {
      return res.status(404).send('Producto no encontrado')
   }

   const result = await updateProduct(idProduct, productData);
   if(!result) {
      return res.status(404).send('Error al buscar y editar el producto')
   }
   res.status(200).send({
      message: 'User updated successfully',
      data: result.message
   });
});

router.delete('/:id', authenticate, authorize([UserRole.Admin]), async (req: Request, res: Response, next: NextFunction) => {
   deleteProduct(req.params.id)
      .then((data) => {
         switch(data.status){
            case 200:
               res.status(200).send(`Customer ${req.params.id} deleted`);
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

import express, { Request, Response, NextFunction } from 'express';
import controllerError  from '../../middleware/controllerError';
import { generateToken, authenticate } from '../../middleware/auth';
import { CustomRequest } from '../../types/Users';
import { addUser, loginUser, updateUser, deleteUserPartial } from './controller';
import { authorize } from '../../middleware/auth';
import { UserRole } from '../../types/Roles';
const router = express.Router();

router.post('/', authenticate, authorize([UserRole.Admin]), function(req, res) { ///// Falta autenticación   
   addUser(req.body)   
      .then((data) => {
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

router.post('/login', async (req: CustomRequest, res: Response, next: NextFunction) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(404).json('User data is missing');
   }

   const result = await loginUser(email, password);
   

   if (result.status !== 200 || !result.user) {
      return res.status(result.status).send(result.message);
   }

   req.user = result.user;
   next();
}, generateToken, (req: CustomRequest, res) => {
   res.status(200).send({
      message: 'Login successful',
      token: req.token,
   });
});

router.put('/update', authenticate, async (req: CustomRequest, res: Response, next: NextFunction) => {
   const userId = req.user?.id;
   const userData = req.body;

   if (!userId) {
      return res.status(401).send('No estas autorizado');
   }

   const result = await updateUser(userId, userData);

   if (result.status !== 200 || !result.user) {
      return res.status(result.status).send(result.message);
   }

   res.status(200).send({
      message: 'User updated successfully',
      user: result.user
   });
});

router.delete('/:id', authenticate, authorize([UserRole.Admin]), async (req: CustomRequest, res: Response, next: NextFunction) => {
   deleteUserPartial(req.params.id)
      .then((resp) => {
         switch (resp.status) {
            case 200:
               res.status(200).send(`User ${req.params.id} deleted`);
               break;
            case 400:
               res.status(resp.status).send(resp.message);
               break;
         }
      })
      .catch((e) => {
         console.log(e);
         res.status(500).send("Unexpected Error");
      });
});

export default router;

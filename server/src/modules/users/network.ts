import express, { Request, Response, NextFunction } from 'express';
import controllerError  from '../../middleware/controllerError';
import { generateToken, authenticate } from '../../middleware/auth';
import { CustomRequest } from '../../types/Users';
import { addUser, loginUser, updateUser, deleteUserPartial, logoutUser } from './controller';
import { authorize } from '../../middleware/auth';
import { UserRole } from '../../types/Roles';
import Users from './model'; // Agregar esta importación
import Session from '../sessions/model';
import jwt from 'jsonwebtoken';
import config from '../../config/commons';
const router = express.Router();

//Crea un usuario nuevo
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

//Logeo de usuario
router.post('/login', async (req: CustomRequest, res: Response, next: NextFunction) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json('Datos de usuario faltantes');
   }

   const result = await loginUser(email, password);
   
   if (result.status !== 200 || !result.user) {
      return res.status(result.status).send(result.message);
   }

   // Generar token JWT
   const token = jwt.sign(
      { id: result.user.id, roleId: result.user.roleId }, // Usar result.user.id
      config.jwt_secret,
      { expiresIn: '24h' }
   );

   // Crear sesión en base de datos
   const session = new Session({
      userId: result.user.id, // Cambiar result.user._id por result.user.id
      token,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
   });
   
   await session.save();

   res.status(200).send({
      message: 'Login successful',
      token: token,
      user: {
         id: result.user.id,
         name: result.user.name,
         lastname: result.user.lastname,
         email: result.user.email
      }
   });
});

//Edita un usuario
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

//Elimina de manera pasiva un cliente
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

//Obtener información del usuario actual
router.get('/me', authenticate, async (req: CustomRequest, res: Response) => {
   try {
      const userId = req.user?.id;
      
      if (!userId) {
         return res.status(401).json({ 
            error: 'No autorizado',
            success: false 
         });
      }

      // Buscar el usuario por ID y popular el rol
      const user = await Users.findById(userId)
         .select('-password') // Excluir la contraseña por seguridad
         .populate('roleId', 'name'); // Popular el nombre del rol

      if (!user) {
         return res.status(404).json({ 
            error: 'Usuario no encontrado',
            success: false 
         });
      }

      // Devolver la información del usuario
      res.json({
         id: user._id,
         name: user.name,
         lastname: user.lastname,
         email: user.email,
         image: user.image,
         role: user.roleId,
         active: user.active,
         createdAt: user.createdAt,
         updatedAt: user.updatedAt
      });
      
   } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      res.status(500).json({ 
         error: 'Error al obtener información del usuario',
         success: false 
      });
   }
});

//Logout
router.post('/logout', authenticate, async (req, res) => {
   try {
      // Marcar la sesión como inactiva
      await Session.findByIdAndUpdate(req.sessionId, { 
         isActive: false,
         lastActivity: new Date()
      });

      console.log(`Usuario ${req.user?.name} cerró sesión - Sesión invalidada`);
      
      res.json({ 
         message: 'Sesión cerrada exitosamente',
         success: true 
      });
   } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
         error: 'Error al cerrar sesión',
         success: false 
      });
   }
});

export default router;

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/commons';
import { CustomRequest, UserType } from '../types/Users';
import { UserRole } from '../types/Roles';
import Roles from '../modules/roles/model';
import Users from '../modules/users/model';
import Session from '../modules/sessions/model';

export const generateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
   const user = req.user;

   if (!user) {
      return res.status(401).send('unauthorized');
   }
   const payload = {
      id: user.id,
      roleId: user.roleId
   };   
   const token = jwt.sign( payload, config.jwt_secret, { expiresIn: '24h' });
   res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });

   req.token = token;
   next();
};

export const authenticate = async (req: CustomRequest, res: Response, next: NextFunction) => {
   try {
      let token: string | undefined;
      
      // Buscar token en cookies o headers
      token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
         return res.status(401).json({ error: 'Token no proporcionado' });
      }

      // PRIMERO: Buscar la sesión sin populate
      const session = await Session.findOne({
         token,
         isActive: true,
         expiresAt: { $gt: new Date() }
      });

      if (!session) {
         return res.status(401).json({ error: 'Sesión inválida o expirada' });
      }
      // SEGUNDO: Buscar el usuario manualmente
      const user = await Users.findById(session.userId).select('name lastname email roleId active');
      
      if (!user) {
         return res.status(401).json({ error: 'Usuario no encontrado' });
      }
      // Actualizar última actividad
      await Session.updateOne(
         { _id: session._id },
         { lastActivity: new Date() }
      );

      req.user = user;
      req.sessionId = session._id;
      next();
   } catch (err) {
      console.error('❌ Error de autenticación:', err);
      return res.status(401).json({ error: 'Error de autenticación' });
   }
};

export const authorize = (roles: UserRole[]) => {
   return async (req: CustomRequest, res: Response, next: NextFunction) => {
      try {
         // El usuario ya fue autenticado por el middleware authenticate
         // req.user ya contiene el objeto completo del usuario
         
         if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
         }
         // Obtener el rol del usuario
         const userRole = await Roles.findById(req.user.roleId);

         if (!userRole) {
            return res.status(403).json({ error: 'Rol de usuario no encontrado' });
         }
         // Verificar si el rol del usuario tiene permisos suficientes
         if (!roles.includes(userRole.name as UserRole)) {
            return res.status(403).json({ error: 'No tienes permisos suficientes' });
         }
         console.log('✅ Autorización exitosa');
         next();
      } catch (err) {
         console.error('❌ Error en la autorización:', err);
         return res.status(403).json({ error: 'Error de autorización' });
      }
   };
};
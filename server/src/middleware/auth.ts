import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/commons';
import { CustomRequest, UserType } from '../types/Users';
import { UserRole } from '../types/Roles';
import Roles from '../modules/roles/model';

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
   // console.log('[TOKEN] ' + token);
   next();
};

export const authenticate = async (req: CustomRequest, res: Response, next: NextFunction) => {
   try {
      const token = req.cookies.token;
      if (!token) {
         return res.status(401).send('unauthorized');
      };
      const decoded = jwt.verify(token, config.jwt_secret);
      req.user = decoded as UserType;
      next();
   } catch (err) {
      return res.status(401).send('unauthorized');
   };
};

export const authorize = (roles: UserRole[]) => {
   return async (req: CustomRequest, res: Response, next: NextFunction) => {
      try {
         const token = req.cookies.token;
         if (!token) {
            return res.status(401).send('unauthorized');
         }

         const decoded = jwt.verify(token, config.jwt_secret);
         req.user = decoded as UserType;

         // Obtener el rol del usuario
         const userRole = await Roles.findById(req.user.roleId);

         // Verificar si el rol del usuario tiene permisos suficientes
         if (!userRole || !roles.includes(userRole.name as UserRole)) {
            return res.status(403).send('You not have authorization');
         }

         next();
      } catch (err) {
         console.error('Error en la autorización:', err);
         return res.status(401).send('unauthorized');
      }
   };
};
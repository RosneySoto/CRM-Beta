import { addUser as _addUser, 
   userFindEmail as _userFindEmail,
   login as _login, 
   updateUser as _updateUser,
   deleteUser as _deleteUser
} from './store';
import { UserType } from '../../types/Users';
import { compare, encrypt } from '../../middleware/bcrypt';
import Users from './model';
import Roles from '../roles/model';
import { RoleType, UserRole } from '../../types/Roles';

export async function addUser(data: UserType) {
   try {
      const { name, lastname, image, email, password, roleId } = data;

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
         return {
            status: 401,
            message: 'User already exists',
         };
      };

      let passwordHash: string | undefined;
      if (password && password.trim() !== '') {
         passwordHash = await encrypt(password);
      } else {
         return {
            status: 400,
            message: 'Password is required',
         };
      };

      // Crear nuevo usuario con el ID del rol 'Admin'
      const newUser = new Users({
         name,
         lastname,
         image,
         email,
         password: passwordHash,
         roleId,
      });

      const result = await newUser.save();
      return {
         status: 201,
         message: result,
      };
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};

export async function loginUser(email: string, password: string) {
   try {
      const result = await _login(email, password);
      if (result.status !== 200) {
         return result;
      } else {
         return {
            status: 200,
            user: result.user,
            message: 'Login successful'
         };
      }
   } catch (error) {
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   };
};

export async function updateUser(id: string, userData: UserType) {
   try {
      const result = await _updateUser(id, userData);
      if(!result){
         return {
            status: 404,
            message: 'An error occurred while updating the user'
         }
      } else {
         return {
            status: 200,
            user: result.user
         }
      };
   } catch (error) {
      console.log(error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      }
   }
};

export async function deleteUserPartial(id: string) {
   try {
      const result = await _deleteUser(id);
      return result;
   } catch (error) {
      console.log(error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error
      };
   };
};

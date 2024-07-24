import Users from './model';
import { UserType, LoginResponse } from '../../types/Users';
import { compare, encrypt } from '../../middleware/bcrypt';

export async function addUser(data: UserType) {
   try {

      const newItem = new Users(data);
      
      const result = await newItem.save();
      return {
         status: 201,
         message: result,
      };
   } catch (e) {
      console.log("[ERROR] -> addUser", e);
      return {
         status: 400,
         message: "An error occurred while creating the user",
         detail: e,
      };
   };
};

export async function userFindEmail(data: UserType) {
   try {
      const result = await Users.findOne({ email: data.email });
      if(!result){
         return {
            status: 200,
            message: result,
         };
      } else {
         return {
            status: 404,
            message: null,
         };
      }  
   } catch (e) {
      console.log("[ERROR] -> userFindEmail", e);
      return {
         status: 400,
         message: "An error occurred while looking the user",
         detail: e,
      };
   };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
   try {
      const userFind = await Users.findOne({ email: email });

      if(userFind?.active === false){
         return {
            status: 404,
            message: 'User unavailable, concat your administrator'
         };
      }

      if (!userFind) {
         return {
            status: 404,
            message: 'User or Password incorrect'
         };
      } else {
         const checkPass = await compare(password, userFind.password);

         if (checkPass) {
            const user: UserType = {
               id: userFind._id.toString(),
               name: userFind.name,
               lastname: userFind.lastname,
               image: userFind.image || '',
               email: userFind.email,
               password: userFind.password,
               roleId: userFind.roleId.toString()
            };
            return {
               status: 200,
               user: user
            };
         } else {
            return {
               status: 404,
               message: 'User or Password not exists'
            };
         }
      }
   } catch (e) {
      console.log(e);
      return {
         status: 400,
         message: 'An error occurred while trying to login'
      };
   };
};

export async function updateUser(id: string, userData: UserType) {
   try {
      if(userData.password && userData.password.trim() !== ''){
         userData.password = await encrypt(userData.password);
      } else {
         delete userData.password;
      };

      const user = await Users.findByIdAndUpdate(id, userData, { new: true });
      
      if(!user){
         return {
            status: 400,
            message: "User not found"
         };   
      }
      return {
         status: 200,
         user: user
      }
   } catch (e) {
      console.log("[ERROR] -> addUser", e);
      return {
         status: 400,
         message: "An error occurred while creating the user",
         detail: e,
      };
   };
};

export async function deleteUser(id: string) {
   try {
      const foundUser = await Users.findOne({ _id: id });

      if(!foundUser) throw new Error('Not user found');
      foundUser.active = false;
      await foundUser.save();

      return{
         status: 200,
         message: 'User deleted'
      }
   } catch (e) {
      console.log("[ERROR] -> addUser", e);
      return {
         status: 400,
         message: "An error occurred while deleting user",
         detail: e,
      };
   };
};

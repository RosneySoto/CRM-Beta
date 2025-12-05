import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const UserContext = createContext();

export const useUser = () => {
   const context = useContext(UserContext);
   if (!context) {
      throw new Error('useUser must be used within a UserProvider');
   }
   return context;
};

export const UserProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchUserInfo();
   }, []);

   const fetchUserInfo = async () => {
      try {
         const token = Cookies.get('token');
         
         if (!token) {
            setLoading(false);
            return;
         }

         const response = await axios.get('http://localhost:5000/users/me', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         setUser(response.data);
      } catch (error) {         
         // Si hay error, probablemente el token expiró
         Cookies.remove('token');
      } finally {
         setLoading(false);
      }
   };

   const logout = async () => {
      try {
         const token = Cookies.get('token');
         if (token) {
            await axios.post('http://localhost:5000/users/logout', {}, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
         }
      } catch (error) {
         console.error('Error during logout:', error);
      } finally {
         // Siempre limpiar el estado local
         Cookies.remove('token');
         setUser(null);
      }
   };

   const value = {
      user,
      loading,
      fetchUserInfo,
      logout
   };

   return (
      <UserContext.Provider value={value}>
         {children}
      </UserContext.Provider>
   );
};

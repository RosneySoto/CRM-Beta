import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginCard from '@/components/LoginCard';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';



function LoginPage() {
   const navigate = useNavigate();
   const [error, setError] = useState(null);

   const handleLoginSubmit = async ({ email, password }) => {
      try {
         const response = await axios.post('http://localhost:5000/users/login', { email, password });
         // console.log('*** ', response,  ' ***');

         const token = response.data.token; // Obtener el token de la respuesta del backend
         // console.log('*** ' + token + ' ***');
         
         const decodedToken = jwtDecode(token);
         const userId = decodedToken.id;
         const userName = decodedToken.name;
         const userLastname = decodedToken.lastname;

         Cookies.set('token', token, { secure: false });
         Cookies.set('userId', userId, { secure: false });
         Cookies.set('userName', userName, { secure: false });
         Cookies.set('userLastname', userLastname, { secure: false });

         navigate('/customer'); // Redirigir al usuario a la vista de Tareas si el inicio de sesión es exitoso
      } catch (error) {
         console.error('Error:', error);
         setError(error.response);
      }
   };

   return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
         <div className="card p-4">
            <h2 className="text-center mb-4" style={{ paddingBottom: '40px', paddingTop: '10px' }}>Bienvenido!</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <LoginCard onSubmit={handleLoginSubmit} />
         </div>
      </div>
   );
}

export default LoginPage;

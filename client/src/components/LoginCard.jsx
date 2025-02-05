import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginCard({ onSubmit }) {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate(); // Hook para redirección

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ email, password });

      // Redirigir al dashboard con el Sidebar
      navigate('/ ');
   };

   return (
      <form onSubmit={handleSubmit} className="w-100">
         <div className="form-group" style={{ paddingBottom: '20px' }}>
            <label htmlFor="exampleInputEmail1">Correo Electrónico</label>
            <input
               type="email"
               className="form-control"
               id="exampleInputEmail1"
               aria-describedby="emailHelp"
               placeholder="Ingresa tu email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />
         </div>

         <div className="form-group" style={{ paddingBottom: '20px' }}>
            <label htmlFor="exampleInputPassword1">Password</label>
            <input
               type="password"
               className="form-control"
               id="exampleInputPassword1"
               placeholder="Ingresa tu clave megasecreta"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
            />
         </div>
         <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
         <Link to="/register">Quiero registrarme</Link>
      </form>
   );
}

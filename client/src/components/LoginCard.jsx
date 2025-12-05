"use client"

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/loginCard.css";

export default function LoginCard() {
   const [formData, setFormData] = useState({
      email: "",
      password: ""
   });
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState({});
   const navigate = useNavigate();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
      
      // Clear errors when user starts typing
      if (errors[name]) {
         setErrors(prev => ({ ...prev, [name]: "" }));
      }
   };

   const validateForm = () => {
      const newErrors = {};
      
      if (!formData.email.trim()) {
         newErrors.email = "El email es obligatorio";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = "Email inválido";
      }
      
      if (!formData.password.trim()) {
         newErrors.password = "La contraseña es obligatoria";
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setLoading(true);
      try {
         const response = await axios.post("http://localhost:5000/users/login", {
            email: formData.email,
            password: formData.password
         });

         if (response.data.token) {
            Cookies.set("token", response.data.token, { expires: 7 });
            Swal.fire({
               icon: 'success',
               title: '¡Bienvenido!',
               text: 'Inicio de sesión exitoso',
               timer: 1500,
               showConfirmButton: false
            });
            navigate("/dashboard"); // Redirigir a URL específica del dashboard
         }
      } catch (error) {
         console.error("Login error:", error);
         const errorMessage = error.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.";
         setErrors({ submit: errorMessage });
         
         Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
         });
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="login-container">
         <div className="login-card">
            {/* Header */}
            <div className="login-header">
               <div className="login-logo">
                  <i className="fas fa-car"></i>
               </div>
               <h1 className="login-title">
                  <i className="fas fa-sign-in-alt"></i> CarWash Pro
               </h1>
               <p className="login-subtitle">Sistema de Gestión</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
               <div className="form-section">
                  <h3><i className="fas fa-lock"></i> Iniciar Sesión</h3>
                  
                  <div className="form-group">
                     <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Correo Electrónico
                     </label>
                     <div className="input-with-icon">
                        <i className="fas fa-envelope input-icon"></i>
                        <input
                           type="email"
                           id="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           placeholder="tu@email.com"
                           className={errors.email ? 'error' : ''}
                           required
                        />
                     </div>
                     {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                     <label htmlFor="password">
                        <i className="fas fa-key"></i> Contraseña
                     </label>
                     <div className="input-with-icon">
                        <i className="fas fa-key input-icon"></i>
                        <input
                           type="password"
                           id="password"
                           name="password"
                           value={formData.password}
                           onChange={handleChange}
                           placeholder="••••••••"
                           className={errors.password ? 'error' : ''}
                           required
                        />
                     </div>
                     {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  {errors.submit && (
                     <div className="error-message submit-error">
                        {errors.submit}
                     </div>
                  )}

                  <button 
                     type="submit" 
                     className="login-btn"
                     disabled={loading}
                  >
                     {loading ? (
                        <>
                           <i className="fas fa-spinner fa-spin"></i> Iniciando...
                        </>
                     ) : (
                        <>
                           <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                        </>
                     )}
                  </button>
               </div>
            </form>

            {/* Footer */}
            <div className="login-footer">
               <p>
                  ¿No tienes cuenta? 
                  <Link to="/register" className="register-link">
                     <i className="fas fa-user-plus"></i> Regístrate
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
}

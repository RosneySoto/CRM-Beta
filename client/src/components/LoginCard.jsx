"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Input, Button, Card, CardBody } from "@heroui/react"
import "../styles/LoginCard.css"

export default function LoginCard({ onSubmit }) {
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const navigate = useNavigate()

   const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit({ email, password })
      navigate("/")
   }

   return (
      <div className="login-container">
         <Card className="login-card">
            <CardBody>
               {/* Header */}
               <div className="login-header">
                  <h1 className="login-title">Bienvenido</h1>
                  <p className="login-subtitle">Inicia sesión en tu cuenta</p>
               </div>

               {/* Google Button */}
               <Button
                  className="google-button"
                  onPress={() => console.log("Login con Google")}
                  fullWidth
               >
                  <img
                     src="https://www.svgrepo.com/show/475656/google-color.svg"
                     alt="Google"
                     className="google-icon"
                  />
                  Continuar con Google
               </Button>

               <div className="divider-container">
                  <div className="divider-line"></div>
                  <span className="divider-text">O continúa con tu email</span>
                  <div className="divider-line"></div>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit} className="login-form">
                  <Input
                     isRequired
                     type="email"
                     label="Email"
                     placeholder="tu@email.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="input-field"
                  />

                  <Input
                     isRequired
                     type="password"
                     label="Contraseña"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="input-field"
                  />

                  <div className="forgot-password">
                     <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                  </div>

                  <Button
                     type="submit"
                     color="primary"
                     fullWidth
                     className="submit-button"
                  >
                     Iniciar Sesión
                  </Button>
               </form>

               {/* Register */}
               <div className="register-link">
                  <p>
                     ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
                  </p>
               </div>
            </CardBody>
         </Card>
      </div>
   )
}

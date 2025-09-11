"use client"

import React from "react"
import "../styles/login-style.css"

interface LoginFormProps {
   onSubmit: (email: string, password: string) => Promise<void>
   isLoading?: boolean
   serverError?: string | null
}

interface FormData {
   email: string
   password: string
}

interface FormErrors {
   email: string
   password: string
}

export default function LoginForm({ onSubmit, isLoading = false, serverError = null }: LoginFormProps) {
   const [formData, setFormData] = React.useState<FormData>({
      email: "",
      password: "",
   })
   const [errors, setErrors] = React.useState<FormErrors>({
      email: "",
      password: "",
   })

   const validateForm = (): boolean => {
      const newErrors = { email: "", password: "" }

      if (!formData.email) {
         newErrors.email = "Please enter a valid email"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = "Please enter a valid email format"
      }

      if (!formData.password) {
         newErrors.password = "Please enter a password"
      }

      setErrors(newErrors)
      return !newErrors.email && !newErrors.password
   }

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))

      // Clear field error when user starts typing
      if (errors[name as keyof FormErrors]) {
         setErrors((prev) => ({
            ...prev,
            [name]: "",
         }))
      }
   }

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!validateForm()) {
         return
      }

      await onSubmit(formData.email, formData.password)
   }

   return (
      <div className="login-container">
         <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="form-title">Bienvenido!</h1>

            {serverError && (
               <div className="error-message" style={{ marginBottom: "20px", textAlign: "center" }}>
                  {serverError}
               </div>
            )}

            <div className="input-container">
               <label htmlFor="email" className="input-label">
                  Email
               </label>
               <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu email"
                  className="custom-input"
                  disabled={isLoading}
                  required
               />
               {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="input-container">
               <label htmlFor="password" className="input-label">
                  Password
               </label>
               <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu contraseña"
                  className="custom-input"
                  disabled={isLoading}
                  required
               />
               {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="buttons-container">
               <button type="submit" className="custom-button submit-button" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
               </button>
            </div>
         </form>
      </div>
   )
}

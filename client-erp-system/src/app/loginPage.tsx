"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import LoginForm from "../pages/loginForm"
import { AuthService } from "../services/authService"

export default function LoginPage() {
   const router = useNavigate()
   const [isLoading, setIsLoading] = React.useState(false)
   const [serverError, setServerError] = React.useState<string | null>(null)

   const handleLogin = async (email: string, password: string) => {
      setIsLoading(true)
      setServerError(null)

      try {
         await AuthService.login(email, password)
         router("/customer")
      } catch (error: any) {
         setServerError(error.message)
      } finally {
         setIsLoading(false)
      }
   }

   return <LoginForm onSubmit={handleLogin} isLoading={isLoading} serverError={serverError} />
}

import axios from "axios"
import Cookies from "cookiejs"
import { jwtDecode } from "jwt-decode"

interface LoginResponse {
   token: string
}

interface DecodedToken {
   id: string
   name: string
   lastname: string
}

export class AuthService {
   private static readonly API_BASE_URL = "http://localhost:5000"

   static async login(email: string, password: string): Promise<void> {
      try {
         const response = await axios.post<LoginResponse>(`${this.API_BASE_URL}/users/login`, {
            email,
            password,
         })

         const token = response.data.token
         const decodedToken = jwtDecode(token) as DecodedToken

         // Store user data in cookies
         this.setUserCookies(token, decodedToken)
      } catch (error: any) {
         // Re-throw with standardized error messages
         if (error.response?.data?.message) {
            throw new Error(error.response.data.message)
         } else if (error.response?.status === 401) {
            throw new Error("Credenciales incorrectas")
         } else {
            throw new Error("Error de conexión. Intenta nuevamente.")
         }
      }
   }

   private static setUserCookies(token: string, decodedToken: DecodedToken): void {
      const cookieOptions = { secure: false }

      Cookies.set("token", token, cookieOptions)
      Cookies.set("userId", decodedToken.id, cookieOptions)
      Cookies.set("userName", decodedToken.name, cookieOptions)
      Cookies.set("userLastname", decodedToken.lastname, cookieOptions)
   }

   static logout(): void {
      Cookies.remove("token")
      Cookies.remove("userId")
      Cookies.remove("userName")
      Cookies.remove("userLastname")
   }

   static getToken(): string | undefined {
      const token = Cookies.get("token")
      return typeof token === "string" ? token : undefined
   }


   static isAuthenticated(): boolean {
      return !!this.getToken()
   }

   static getUserData() {
      return {
         userId: Cookies.get("userId"),
         userName: Cookies.get("userName"),
         userLastname: Cookies.get("userLastname"),
      }
   }
}

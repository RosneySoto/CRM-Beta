import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import CustomerList from "./pages/CustomerPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DashboardLayout from "./components/DashboardLayaout.jsx";
import OrderBuyCard from "./pages/OrderBuyPage.jsx";
import { UserProvider } from "./contexts/UserContext";

export default function App() {
   return (
      <UserProvider>
         <Router>
            <Routes>
               {/* Ruta de Login */}
               <Route path="/login" element={<LoginPage />} />

               {/* Rutas Protegidas con Sidebar */}
               <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="customer" element={<CustomerList />} />
                  <Route path="order" element={<OrderBuyCard />} />
               </Route>

               {/* Redirección si la ruta no existe */}
               <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
         </Router>
      </UserProvider>
   );
}
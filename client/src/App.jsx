import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import CustomerList from "./pages/CustomerPage.jsx";
import DashboardLayout from "./components/DashboardLayaout.jsx";
import OrderBuyCard from "./pages/OrderBuyPage.jsx";

export default function App() {
   return (
      <Router basename="/CRM-Beta">
         <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Redirección desde la raíz hacia el login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={<DashboardLayout />}>
               <Route path="customer" element={<CustomerList />} />
               <Route path="order" element={<OrderBuyCard />} />
            </Route>

            {/* Si no existe la ruta, mandamos al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
         </Routes>
      </Router>
   );
}

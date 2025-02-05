import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import CustomerList from "./pages/customerPage.jsx";
import CreateCustomerPage from "./pages/CreateCustomerPage.jsx";
import DashboardLayout from "./components/DashboardLayaout.jsx"; // Nuevo componente para el layout

export default function App() {
   return (
      <Router>
         <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Protegidas con Sidebar */}
            <Route path="/" element={<DashboardLayout />}>
               <Route path="customer" element={<CustomerList />} />
               <Route path="customer/view-add" element={<CreateCustomerPage />} />
            </Route>

            {/* Redirección si la ruta no existe */}
            <Route path="*" element={<Navigate to="/customer" />} />
         </Routes>
      </Router>
   );
}

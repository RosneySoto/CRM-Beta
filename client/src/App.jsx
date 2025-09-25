import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.jsx";
import CustomerList from "@/pages/CustomerPage.jsx";
// import CreateCustomerPage from "@/pages/CreateCustomerPage.jsx";
import DashboardLayout from "@/components/DashboardLayaout.jsx"; // Nuevo componente para el layout
import OrderBuyCard from "@/pages/OrderBuyPage.jsx"

export default function App() {
   return (
      <Router>
         <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Protegidas con Sidebar */}
            <Route path="/" element={<DashboardLayout />}>
               <Route path="customer" element={<CustomerList />} />
               {/* <Route path="customer/view-add" element={<CreateCustomerPage />} /> */}
               <Route path="order" element={<OrderBuyCard />} />
            </Route>

            {/* Redirección si la ruta no existe */}
            <Route path="*" element={<Navigate to="/customer" />} />
         </Routes>
      </Router>
   );
}

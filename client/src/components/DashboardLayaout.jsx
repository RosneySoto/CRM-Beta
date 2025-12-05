import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import { useUser } from "../contexts/UserContext";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";

const DashboardLayout = () => {
   const navigate = useNavigate();
   const { user, loading } = useUser();
   const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

   useEffect(() => {
      // Solo redirigir si NO estamos cargando y NO hay usuario
      // Y solo si no estamos en el proceso de login (checando si hay token)
      const token = Cookies.get('token');
      if (!loading && !user && !token) {
         navigate("/login");
      }
   }, [user, loading, navigate]);

   const toggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
   };

   if (loading) {
      return (
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loading-spinner">
               <i className="fas fa-spinner fa-spin"></i>
               <p>Cargando...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="dashboard-layout">
         <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar}
            user={user}
         />
         <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Outlet />
         </div>
      </div>
   );
};

export default DashboardLayout;

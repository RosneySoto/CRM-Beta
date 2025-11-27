import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import Cookies from "js-cookie";

const DashboardLayout = () => {
   const navigate = useNavigate();
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

   useEffect(() => {
      const token = Cookies.get("token");

      if (!token) {
         navigate("/login"); // Si no hay sesión, redirigir al login
      }
   }, [navigate]);

   const toggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
   };

   return (
      <div className="dashboard-layout">
         <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar} 
         />
         <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Outlet />
         </div>
      </div>
   );
};

export default DashboardLayout;

import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/SideBar";
import Cookies from "js-cookie";

const DashboardLayout = () => {
   // const navigate = useNavigate();

   // useEffect(() => {
   //    const token = Cookies.get("token");

   //    if (!token) {
   //       navigate("/login"); // Si no hay sesión, redirigir al login
   //    }
   // }, [navigate]);

   return (
      <div style={{ display: "flex", height: "100vh" }}>
         <Sidebar />
         <div style={{ flex: 1, padding: "20px" }}>
            <Outlet />
         </div>
      </div>
   );
};

export default DashboardLayout;

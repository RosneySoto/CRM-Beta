import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = ({ collapsed, onToggle }) => {
   const location = useLocation();

   const menuItems = [
      {
         path: "/customer",
         label: "Clientes",
         icon: "fas fa-users"
      },
      {
         path: "/order",
         label: "Órdenes de Servicios",
         icon: "fas fa-shopping-cart"
      },
      {
         path: "/billing",
         label: "Facturación",
         icon: "fas fa-file-invoice-dollar"
      },
      {
         path: "/roles",
         label: "Roles",
         icon: "fas fa-user-shield"
      },
      {
         path: "/users",
         label: "Usuarios",
         icon: "fas fa-user-cog"
      }
   ];

   return (
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
         <div className="sidebar-header">
            <div className="sidebar-brand">
               <div className="sidebar-logo">
                  <i className="fas fa-car"></i>
                  {!collapsed && <span>CarWash Pro</span>}
               </div>
               {!collapsed && (
                  <div className="sidebar-subtitle">
                     Sistema de Gestión
                  </div>
               )}
            </div>
            <button className="sidebar-toggle" onClick={onToggle}>
               <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
         </div>

         <nav className="sidebar-nav">
            <ul className="sidebar-menu">
               {menuItems.map((item, index) => (
                  <li key={index} className="sidebar-menu-item">
                     <Link 
                        to={item.path} 
                        className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                     >
                        <div className="sidebar-link-content">
                           <i className={item.icon}></i>
                           {!collapsed && <span>{item.label}</span>}
                        </div>
                        {location.pathname === item.path && (
                           <div className="sidebar-active-indicator"></div>
                        )}
                     </Link>
                  </li>
               ))}
            </ul>
         </nav>

         <div className="sidebar-footer">
            <div className="sidebar-user-info">
               <i className="fas fa-user-circle"></i>
               {!collapsed && <span>Administrador</span>}
            </div>
         </div>
      </div>
   );
};

export default Sidebar;

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { useUser } from "../contexts/UserContext";
import "../styles/sidebar.css";

const Sidebar = ({ collapsed, onToggle, user }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const { logout } = useUser();

   const menuItems = [
      {
         path: "/dashboard", // URL específica para dashboard
         label: "Dashboard",
         icon: "fas fa-chart-line"
      },
      {
         path: "/customer", // Ya tenía URL específica
         label: "Clientes",
         icon: "fas fa-users"
      },
      {
         path: "/order", // Ya tenía URL específica
         label: "Órdenes de Servicios",
         icon: "fas fa-shopping-cart"
      },
      {
         path: "/billing", // Ya tenía URL específica
         label: "Facturación",
         icon: "fas fa-file-invoice-dollar"
      },
      {
         path: "/roles", // Ya tenía URL específica
         label: "Roles",
         icon: "fas fa-user-shield"
      },
      {
         path: "/users", // Ya tenía URL específica
         label: "Usuarios",
         icon: "fas fa-user-cog"
      }
   ];

   const handleLogout = () => {
      Swal.fire({
         title: '¿Cerrar sesión?',
         text: '¿Estás seguro de que quieres cerrar tu sesión?',
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#3085d6',
         confirmButtonText: 'Sí, cerrar sesión',
         cancelButtonText: 'Cancelar'
      }).then(async (result) => {
         if (result.isConfirmed) {
            try {
               await logout();
               
               Swal.fire({
                  icon: 'success',
                  title: 'Sesión cerrada',
                  text: 'Has cerrado sesión exitosamente',
                  timer: 1500,
                  showConfirmButton: false
               });
               
               navigate('/login');
            } catch (error) {
               console.error('Error during logout:', error);
               // Aún así redirigir al login
               navigate('/login');
            }
         }
      });
   };

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
               {!collapsed && (
                  <span>
                     {user ? `${user.name} ${user.lastname}` : 'Usuario'}
                  </span>
               )}
            </div>
            
            <button 
               className="sidebar-logout-btn" 
               onClick={handleLogout}
               title={collapsed ? 'Cerrar sesión' : ''}
            >
               <i className="fas fa-sign-out-alt"></i>
               {!collapsed && <span>Cerrar Sesión</span>}
            </button>
         </div>
      </div>
   );
};

export default Sidebar;

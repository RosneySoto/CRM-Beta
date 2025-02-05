import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
   return (
      <div style={{ width: "250px", background: "#2C3E50", color: "#fff", padding: "20px", height: "100vh" }}>

      <h3>Lista de Acciones</h3><hr />
      
      <ul style={{ listStyle: "none", padding: 0 }}>
         <li><Link to="/customer" style={{ color: "#fff", textDecoration: "none" }}>Clientes</Link></li><br />

         <li><Link to="/orders" style={{ color: "#fff", textDecoration: "none" }}>Órdenes de Compra</Link></li><br />

         <li><Link to="/products" style={{ color: "#fff", textDecoration: "none" }}>Productos</Link></li><br />

         <li><Link to="/roles" style={{ color: "#fff", textDecoration: "none" }}>Roles</Link></li><br />

         <li><Link to="/users" style={{ color: "#fff", textDecoration: "none" }}>Usuarios</Link></li><br />
      </ul>
   </div>
);
};

export default Sidebar;

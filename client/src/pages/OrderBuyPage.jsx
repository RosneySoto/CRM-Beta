import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import OrderModal from "../Modals/OrderBuyModal"; // Importamos el modal
import "../styles/orderList.css";

function OrderList() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         const response = await axios.get("http://localhost:5000/order", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         console.log('***********', response.data);
         setOrders(response.data);
      } catch (err) {
         setError("Error fetching orders");
      } finally {
         setLoading(false);
      }
   };

   if (loading) return <p>Loading orders...</p>;
   if (error) return <p>{error}</p>;

   return (
      <div className="order-container">
         <h2>Orders</h2>
         <button className="new-order-btn" onClick={() => setIsModalOpen(true)}>New Order</button> {/* Botón para abrir modal */}

         <table className="order-table">
            <thead>
               <tr>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Vehicle</th>
                  <th>Created by</th>
                  <th>Actions</th>
               </tr>
            </thead>
            <tbody>
               {orders.map((order) => (
                  <tr key={order._id}>
                     <td>{order.nameService?.product}</td>
                     <td>${parseFloat(order.nameService?.price?.$numberDecimal || 0).toFixed(2)}</td>
                     <td>{order.customerId?.name} {order.customerId?.lastname}</td>
                     <td>{order.customerId?.email}</td>
                     <td>{order.vehicle?.marca} {order.vehicle?.modelo} - {order.vehicle?.patente}</td>
                     <td>{order.createUserId?.name} ({order.createUserId?.email})</td>
                     <td className="order-actions">
                        <button className="edit-btn">
                           {/* Editar */}
                           <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button className="cancel-btn">
                        {/* Eliminar */}
                           <i className="fas fa-times"></i>
                        </button>
                        <button className="charge-btn">
                        {/* Cobrar */}
                           <i className="fas fa-dollar-sign"></i>    
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Modal */}
         <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onOrderCreated={fetchOrders} />
      </div>
   );
}

export default OrderList;

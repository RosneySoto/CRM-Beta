   import React, { useEffect, useState } from "react";
   import Cookies from "js-cookie";
   import axios from "axios";
   import CreateOrderModal from "../Modals/CreateOrderBuyModal";
   import EditOrderModal from "../Modals/EditOrderBuyModal";
   import "../styles/orderList.css";

   function OrderList() {
      const [orders, setOrders] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
      const [isEditModalOpen, setIsEditModalOpen] = useState(false);
      const [selectedOrder, setSelectedOrder] = useState(null); // Estado para la orden seleccionada
      const [products, setProducts] = useState([]);

      useEffect(() => {
         fetchOrders();
         fetchProducts();
      }, []);

      const fetchOrders = async () => {
         try {
            const token = Cookies.get("token");
            if (!token) throw new Error("No token found. Please log in.");

            const response = await axios.get("http://localhost:5000/order", {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });

            setOrders(response.data);
         } catch (err) {
            setError("Error fetching orders");
         } finally {
            setLoading(false);
         }
      };

      const fetchProducts = async () => {
         try {
            const token = Cookies.get("token");
            if (!token) throw new Error("No token found. Please log in.");

            const response = await axios.get("http://localhost:5000/product/allProducts", {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });

            setProducts(response.data);
         } catch (err) {
            setError("Error fetching products");
         }
      };

      const handleEditClick = (order) => {
         setSelectedOrder(order); // Guardamos la orden seleccionada
         setIsEditModalOpen(true); // Abrimos el modal de edición
      };

      const handleOrderUpdated = () => {
         fetchOrders(); // Actualizamos la lista de órdenes después de editar
      };

      if (loading) return <p>Loading orders...</p>;
      if (error) return <p>{error}</p>;

      return (
         <div className="order-container">
            <h2>Ordenes de Servicios</h2>
            <button className="new-order-btn" onClick={() => setIsCreateModalOpen(true)}>
               Crear una orden nueva
            </button>

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
                           <button className="edit-btn" onClick={() => handleEditClick(order)}>
                              <i className="fas fa-pencil-alt"></i> Editar
                           </button>
                           <button className="cancel-btn">
                              <i className="fas fa-times"></i> Eliminar
                           </button>
                           <button className="charge-btn">
                              <i className="fas fa-dollar-sign"></i> Cobrar
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {/* Modal de creación */}
            <CreateOrderModal
               isOpen={isCreateModalOpen}
               onClose={() => setIsCreateModalOpen(false)}
               onOrderCreated={fetchOrders}
               products={products}
            />

            {/* Modal de edición */}
            <EditOrderModal
               isOpen={isEditModalOpen}
               onClose={() => setIsEditModalOpen(false)}
               onOrderUpdated={handleOrderUpdated}
               selectedOrder={selectedOrder}
               products={products}
            />
         </div>
      );
   }

   export default OrderList;

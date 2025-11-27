import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import CreateOrderModal from "../Modals/CreateOrderBuyModal";
import EditOrderModal from "../Modals/EditOrderBuyModal";
import PaymentModal from "../Modals/PaymentModal";
import "../styles/orderList.css";
import Swal from 'sweetalert2';

function OrderList() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [products, setProducts] = useState([]);
   const [filterStatus, setFilterStatus] = useState('all');

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
      setSelectedOrder(order);
      setIsEditModalOpen(true);
   };

   const handleOrderUpdated = () => {
      fetchOrders();
   };

   const handleDeleteOrder = async (orderId) => {
      const result = await Swal.fire({
         title: '¿Estás seguro?',
         text: 'Esta acción eliminará la orden de forma permanente.',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
         try {
            const token = Cookies.get('token');
            if (!token) throw new Error('No token found');

            await axios.delete(`http://localhost:5000/order/delete/${orderId}`, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true
            });

            await fetchOrders();
            Swal.fire('Eliminado', 'La orden ha sido eliminada correctamente.', 'success');
         } catch (error) {
            console.error('Error al eliminar la orden:', error);
            Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar la orden.', 'error');
         }
      }
   };

   const handlePaymentClick = (order) => {
      setSelectedOrder(order);
      setIsPaymentModalOpen(true);
   };

   const handlePaymentCompleted = () => {
      fetchOrders();
   };

   const getFilteredOrders = () => {
      switch (filterStatus) {
         case 'active':
            return orders.filter((order) => order.active === true);
         case 'inactive':
            return orders.filter((order) => order.active === false);
         case 'all':
         default:
            return orders;
      }
   };

   if (loading && orders.length === 0) return <p className="loading-text">Cargando órdenes...</p>;
   if (error) return <p className="error-text">{error}</p>;

   return (
      <div className="order-container">
         <h2>
            <i className="fas fa-shopping-cart"></i> Gestión de Órdenes
         </h2>
         
         {/* Controles de filtro */}
         <div className="filter-controls">
            <button 
               className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
               onClick={() => setFilterStatus('all')}
            >
               Todas ({orders.length})
            </button>
            <button 
               className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
               onClick={() => setFilterStatus('active')}
            >
               Pendientes ({orders.filter(o => o.active === true).length})
            </button>
            <button 
               className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
               onClick={() => setFilterStatus('inactive')}
            >
               Cobradas ({orders.filter(o => o.active === false).length})
            </button>
         </div>

         {/* Controles de búsqueda */}
         <div className="search-controls">
            <div className="search-container">
               <div className="search-label">
                  <i className="fas fa-search"></i> Buscar:
               </div>
               <input
                  type="text"
                  placeholder="Servicio o Cliente"
                  className="search-input"
                  disabled={loading}
               />
               <button 
                  className="create-order-btn" 
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={loading}
               >
                  <i className="fas fa-plus"></i> Crear Nueva Orden
               </button>
            </div>
         </div>

         {/* Tabla de órdenes */}
         <div className="table-container">
            <table className="order-table">
               <thead>
                  <tr>
                     <th><i className="fas fa-concierge-bell"></i> Servicio</th>
                     <th><i className="fas fa-dollar-sign"></i> Precio</th>
                     <th><i className="fas fa-user"></i> Cliente</th>
                     <th><i className="fas fa-envelope"></i> Email</th>
                     <th><i className="fas fa-car"></i> Vehículo</th>
                     <th><i className="fas fa-user-tie"></i> Creado por</th>
                     <th><i className="fas fa-info-circle"></i> Estado</th>
                     <th><i className="fas fa-tools"></i> Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {getFilteredOrders().length > 0 ? (
                     getFilteredOrders().map((order) => (
                        <tr key={order._id} className={!order.active ? 'paid-order' : ''}>
                           <td>
                              <div className="service-name">
                                 <i className="fas fa-concierge-bell"></i>
                                 {order.nameService?.product}
                              </div>
                           </td>
                           <td>
                              <div className="price-amount">
                                 <i className="fas fa-dollar-sign"></i>
                                 ${parseFloat(order.nameService?.price?.$numberDecimal || 0).toFixed(2)}
                              </div>
                           </td>
                           <td>
                              <div className="customer-name">
                                 <i className="fas fa-user-circle"></i>
                                 {order.customerId?.name} {order.customerId?.lastname}
                              </div>
                           </td>
                           <td>
                              <div className="customer-email">
                                 <i className="fas fa-envelope"></i>
                                 {order.customerId?.email}
                              </div>
                           </td>
                           <td>
                              <div className="vehicle-info">
                                 <i className="fas fa-car"></i>
                                 {order.vehicle?.marca} {order.vehicle?.modelo} - {order.vehicle?.patente}
                              </div>
                           </td>
                           <td>
                              <div className="created-by">
                                 <i className="fas fa-user-tie"></i>
                                 {order.createUserId?.name}
                              </div>
                           </td>
                           <td>
                              <span className={`status-badge ${order.active ? 'pending' : 'paid'}`}>
                                 <i className={`fas ${order.active ? 'fa-clock' : 'fa-check-circle'}`}></i>
                                 {order.active ? 'Pendiente' : 'Cobrada'}
                              </span>
                           </td>
                           <td className="order-actions">
                              <button 
                                 className={`edit-btn ${!order.active ? 'disabled' : ''}`}
                                 onClick={() => order.active && handleEditClick(order)}
                                 disabled={!order.active}
                                 title={!order.active ? 'No se puede editar una orden ya cobrada' : 'Editar orden'}
                              >
                                 <i className="fas fa-edit"></i> Editar
                              </button>
                              <button 
                                 className={`cancel-btn ${!order.active ? 'disabled' : ''}`}
                                 onClick={() => order.active && handleDeleteOrder(order._id)}
                                 disabled={!order.active}
                                 title={!order.active ? 'No se puede eliminar una orden ya cobrada' : 'Eliminar orden'}
                              >
                                 <i className="fas fa-times"></i> Eliminar
                              </button>
                              <button 
                                 className={`charge-btn ${!order.active ? 'disabled' : ''}`}
                                 onClick={() => order.active && handlePaymentClick(order)}
                                 disabled={!order.active}
                                 title={!order.active ? 'Esta orden ya fue cobrada' : 'Cobrar orden'}
                              >
                                 <i className="fas fa-dollar-sign"></i> {order.active ? 'Cobrar' : 'Cobrada'}
                              </button>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan="8" className="no-data">
                           <i className="fas fa-info-circle"></i>
                           {orders.length === 0 ? 'No hay órdenes registradas.' : 'No se encontraron órdenes con los filtros aplicados.'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

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

         {/* Nuevo Modal de cobro */}
         <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentCompleted={handlePaymentCompleted}
            selectedOrder={selectedOrder}
         />
      </div>
   );
}

export default OrderList;

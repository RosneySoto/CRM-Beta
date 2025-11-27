import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import CustomerModal from '../Modals/CreateCustomerModal';
import EditCustomerModal from '../Modals/EditCustomerModal';
import '../styles/customerList.css';

function CustomerPage() {
   const [customers, setCustomers] = useState([]);
   const [filteredCustomers, setFilteredCustomers] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [searchEmail, setSearchEmail] = useState('');
   const [selectedCustomer, setSelectedCustomer] = useState(null);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);
   const [loading, setLoading] = useState(false);
   const [filterStatus, setFilterStatus] = useState('all'); // Nuevo estado para el filtro
   const navigate = useNavigate();

   const fetchCustomers = async () => {
      try {
         setLoading(true);
         const token = Cookies.get('token');
         if (!token) throw new Error('No token found. Please log in.');

         const response = await axios.get('http://localhost:5000/customer', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         // Mantener todos los clientes (activos e inactivos) para filtros
         setCustomers(response.data);
         setFilteredCustomers(response.data);
      } catch (error) {
         console.error(error);
         Swal.fire('Error', error.response?.data?.message || 'Hubo un problema al cargar los clientes.', 'error');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchCustomers();
   }, []);

   // Función para filtrar clientes según búsqueda y estado
   useEffect(() => {
      let filtered = customers.filter(customer =>
         (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.lastname.toLowerCase().includes(searchTerm.toLowerCase())) &&
         (searchEmail === '' || customer.email.toLowerCase().includes(searchEmail.toLowerCase()))
      );

      // Aplicar filtro de estado
      switch (filterStatus) {
         case 'active':
            filtered = filtered.filter(customer => customer.active === true);
            break;
         case 'inactive':
            filtered = filtered.filter(customer => customer.active === false);
            break;
         case 'all':
         default:
            // Mantener todos los filtrados por búsqueda
            break;
      }

      setFilteredCustomers(filtered);
   }, [searchTerm, searchEmail, customers, filterStatus]);

   useEffect(() => {
      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedCustomer(null);
         }
      };

      if (showCreateModal || showEditModal) {
         document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
         document.removeEventListener('keydown', handleKeyDown);
      };
   }, [showCreateModal, showEditModal]);

   const handleCreateCustomer = () => {
      setSelectedCustomer(null);
      setShowCreateModal(true);
   };

   const handleEditCustomer = (customerId) => {
      const customerToEdit = customers.find(c => c._id === customerId);
      if (customerToEdit) {
         setSelectedCustomer(customerToEdit);
         setShowEditModal(true);
      }
   };

   const handleSaveCustomer = async (customerData) => {
      try {
         setLoading(true);
         const token = Cookies.get('token');
         if (!token) throw new Error('No token found. Please log in.');

         if (selectedCustomer) {
            await axios.put(`http://localhost:5000/customer/edit/${selectedCustomer._id}`, customerData, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
         } else {
            await axios.post('http://localhost:5000/customer', customerData, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
         }

         setShowCreateModal(false);
         setShowEditModal(false);
         setSelectedCustomer(null);
         await fetchCustomers();
         Swal.fire('Éxito', 'Cliente guardado correctamente.', 'success');
      } catch (error) {
         console.error(error);
         Swal.fire('Error', error.response?.data?.message || 'Hubo un problema al guardar el cliente.', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (customerId) => {
      const confirmResult = await Swal.fire({
         title: '¿Estás seguro?',
         text: 'Esta acción eliminará el cliente de forma permanente.',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#3085d6',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar'
      });

      if (!confirmResult.isConfirmed) return;

      try {
         setLoading(true);
         const token = Cookies.get('token');
         if (!token) throw new Error('No token found. Please log in.');

         await axios.delete(`http://localhost:5000/customer/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         await fetchCustomers();
         Swal.fire('Éxito', 'Cliente eliminado correctamente.', 'success');
      } catch (error) {
         console.error(error);
         Swal.fire('Error', error.response?.data?.message || 'Hubo un problema al eliminar el cliente.', 'error');
      } finally {
         setLoading(false);
      }
   };

   if (loading && customers.length === 0) return <p className="loading-text">Cargando clientes...</p>;

   return (
      <div className="customer-container">
         <h2>
            <i className="fas fa-users"></i> Gestión de Clientes
         </h2>
         
         {/* Controles de filtro */}
         <div className="filter-controls">
            <button 
               className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
               onClick={() => setFilterStatus('all')}
            >
               Todos ({customers.length})
            </button>
            <button 
               className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
               onClick={() => setFilterStatus('active')}
            >
               Activos ({customers.filter(c => c.active === true).length})
            </button>
            <button 
               className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
               onClick={() => setFilterStatus('inactive')}
            >
               Inactivos ({customers.filter(c => c.active === false).length})
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
                  placeholder="Nombre o Apellido"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  disabled={loading}
               />
               <input
                  type="text"
                  placeholder="Email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="search-input"
                  disabled={loading}
               />
               <button 
                  onClick={handleCreateCustomer} 
                  className="create-customer-btn" 
                  disabled={loading}
               >
                  <i className="fas fa-plus"></i> Crear Nuevo Cliente
               </button>
            </div>
         </div>

         {/* Tabla de clientes */}
         <div className="table-container">
            <table className="customer-table">
               <thead>
                  <tr>
                     <th><i className="fas fa-user"></i> Nombre Completo</th>
                     <th><i className="fas fa-envelope"></i> Email</th>
                     <th><i className="fas fa-phone"></i> Teléfono</th>
                     <th><i className="fas fa-info-circle"></i> Estado</th>
                     <th><i className="fas fa-cogs"></i> Vehículos</th>
                     <th><i className="fas fa-tools"></i> Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredCustomers.length > 0 ? (
                     filteredCustomers.map(customer => (
                        <tr key={customer._id} className={!customer.active ? 'inactive-customer' : ''}>
                           <td>
                              <div className="customer-name">
                                 <i className="fas fa-user-circle"></i>
                                 {customer.name} {customer.lastname}
                              </div>
                           </td>
                           <td>
                              <div className="customer-email">
                                 <i className="fas fa-envelope"></i>
                                 {customer.email}
                              </div>
                           </td>
                           <td>
                              <div className="customer-phone">
                                 <i className="fas fa-phone"></i>
                                 {customer.numberPhone}
                              </div>
                           </td>
                           <td>
                              <span className={`status-badge ${customer.active ? 'active' : 'inactive'}`}>
                                 <i className={`fas ${customer.active ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                 {customer.active ? 'Activo' : 'Inactivo'}
                              </span>
                           </td>
                           <td>
                              <span className="vehicle-count">
                                 <i className="fas fa-car"></i>
                                 {customer.vehicles?.length || 0} vehículo{customer.vehicles?.length !== 1 ? 's' : ''}
                              </span>
                           </td>
                           <td className="customer-actions">
                              <button 
                                 onClick={() => handleEditCustomer(customer._id)} 
                                 className="edit-btn" 
                                 disabled={loading}
                                 title="Editar cliente"
                              >
                                 <i className="fas fa-edit"></i> Editar
                              </button>
                              <button 
                                 onClick={() => handleDelete(customer._id)} 
                                 className="delete-btn" 
                                 disabled={loading}
                                 title="Eliminar cliente"
                              >
                                 <i className="fas fa-trash"></i> Eliminar
                              </button>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan="6" className="no-data">
                           <i className="fas fa-info-circle"></i>
                           {customers.length === 0 ? 'No hay clientes registrados.' : 'No se encontraron clientes con los filtros aplicados.'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Modales */}
         <CustomerModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleSaveCustomer} />
         <EditCustomerModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleSaveCustomer} customerData={selectedCustomer} />
      </div>
   );
}

export default CustomerPage;

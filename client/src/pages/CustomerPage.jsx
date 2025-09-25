import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import CustomerModal from '@/Modals/CreateCustomerModal';
import EditCustomerModal from '@/Modals/EditCustomerModal';
import '@/styles/customerList.css';

function CustomerPage() {
   const [customers, setCustomers] = useState([]);
   const [filteredCustomers, setFilteredCustomers] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [searchEmail, setSearchEmail] = useState('');
   const [selectedCustomer, setSelectedCustomer] = useState(null);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);
   const [loading, setLoading] = useState(false);
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

         const activeCustomers = response.data.filter(customer => customer.active);
         setCustomers(activeCustomers);
         setFilteredCustomers(activeCustomers);
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

   useEffect(() => {
      const filtered = customers.filter(customer =>
         (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.lastname.toLowerCase().includes(searchTerm.toLowerCase())) &&
         (searchEmail === '' || customer.email.toLowerCase().includes(searchEmail.toLowerCase()))
      );
      setFilteredCustomers(filtered);
   }, [searchTerm, searchEmail, customers]);

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
         text: 'No podrás revertir esta acción.',
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

   return (
      <div>
         <h2>Clientes</h2>

         <div className="search-container">
            <div className="search-label">Buscar:</div>
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
            <button onClick={handleCreateCustomer} className="create-customer-btn" disabled={loading}>
               Crear Nuevo Cliente
            </button>
         </div>

         <table className="customer-table">
            <thead>
               <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Status</th>
                  <th>Acciones</th>
               </tr>
            </thead>
            <tbody>
               {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                     <tr key={customer._id}>
                        <td>{customer.name} {customer.lastname}</td>
                        <td>{customer.email}</td>
                        <td>{customer.numberPhone}</td>
                        <td>{customer.active ? 'Activo' : 'Inactivo'}</td>
                        <td>
                           <button onClick={() => handleEditCustomer(customer._id)} className="edit-btn" disabled={loading}>Editar</button>
                           <button onClick={() => handleDelete(customer._id)} className="delete-btn" disabled={loading}>Eliminar</button>
                        </td>
                     </tr>
                  ))
               ) : (
                  <tr><td colSpan="5">No hay clientes registrados.</td></tr>
               )}
            </tbody>
         </table>

         {/* Modal para crear cliente */}
         <CustomerModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleSaveCustomer} />

         {/* Modal para editar cliente */}
         <EditCustomerModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleSaveCustomer} customerData={selectedCustomer} />
      </div>
   );
}

export default CustomerPage;

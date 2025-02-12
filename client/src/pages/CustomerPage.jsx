import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import CustomerModal from '../Modals/CreateCustomerModal'; // Importa el componente CustomerModal
import '../styles/customerList.css'; // Importamos el archivo CSS

function CustomerPage() {
   const [customers, setCustomers] = useState([]);
   const [selectedCustomer, setSelectedCustomer] = useState(null);
   const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
   const navigate = useNavigate();

   useEffect(() => {
      const fetchCustomers = async () => {
         try {
            const token = Cookies.get('token');
            if (!token) throw new Error('No token found. Please log in.');

            const response = await axios.get('http://localhost:5000/customer', {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });

            const activeCustomers = response.data.filter(customer => customer.active === true);
            setCustomers(activeCustomers);
         } catch (error) {
            console.error(error);
         }
      };

      fetchCustomers();
   }, [navigate]);

   const handleCreateCustomer = () => {
      setSelectedCustomer(null); // No hay cliente seleccionado cuando creamos uno nuevo
      setShowModal(true);
   };

   const handleEditCustomer = (customerId) => {
      const customerToEdit = customers.find(c => c._id === customerId);
      setSelectedCustomer(customerToEdit);
      setShowModal(true);
   };

   const handleSaveCustomer = async (customerData) => {
      try {
         const token = Cookies.get('token');
         if (!token) throw new Error('No token found. Please log in.');

         if (selectedCustomer) {
            // Editar cliente
            await axios.put(`http://localhost:5000/customer/edit/${selectedCustomer._id}`, customerData, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
         } else {
            // Crear nuevo cliente
            await axios.post('http://localhost:5000/customer', customerData, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
         }

         setShowModal(false);
         // Actualizar la lista de clientes
         const response = await axios.get('http://localhost:5000/customer', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });
         setCustomers(response.data.filter(customer => customer.active === true));
         Swal.fire('Éxito', 'Cliente eliminado correctamente.', 'success');
      } catch (error) {
         console.error(error);
         Swal.fire('Error', 'Hubo un problema al guardar el cliente.', 'error');
      }
   };

   const handleDelete = async (customerId) => {
      try {
         const token = Cookies.get('token');
         if (!token) throw new Error('No token found. Please log in.');

         await axios.delete(`http://localhost:5000/customer/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         setCustomers(customers.filter(customer => customer._id !== customerId)); // Eliminar el cliente de la lista
         Swal.fire('Éxito', 'Cliente eliminado correctamente.', 'success');
      } catch (error) {
         console.error(error);
         Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
      }
   };

   return (
      <div>
         <h2>Clientes</h2>
         <button
            onClick={handleCreateCustomer}
            className="create-customer-btn"
         >
            Crear Nuevo Cliente
         </button>

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
               {customers.length > 0 ? (
                  customers.map(customer => (
                     <tr key={customer._id}>
                        <td>{customer.name} {customer.lastname}</td>
                        <td>{customer.email}</td>
                        <td>{customer.numberPhone}</td>
                        <td>{customer.active ? 'Activo' : 'Inactivo'}</td>
                        <td>
                           <button onClick={() => handleEditCustomer(customer._id)}>Editar</button>
                           <button onClick={() => handleDelete(customer._id)}>Eliminar</button>
                        </td>
                     </tr>
                  ))
               ) : (
                  <tr><td colSpan="5">No hay clientes registrados.</td></tr>
               )}
            </tbody>
         </table>

         {/* Mostrar el modal */}
         <CustomerModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveCustomer}
            customerData={selectedCustomer}
         />
      </div>
   );
}

export default CustomerPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

function CustomerPage() {
   const [customers, setCustomers] = useState([]);
   const [error, setError] = useState(null);
   const [selectedCustomer, setSelectedCustomer] = useState(null); // Estado para el cliente seleccionado
   const [showEditModal, setShowEditModal] = useState(false); // Controlar la visibilidad del modal
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
            setError(error.response ? error.response.data : 'An error occurred');
         }
      };

      fetchCustomers();
   }, [navigate]);

   useEffect(() => {
      // Cerrar el modal si se presiona la tecla ESC
      const handleEsc = (event) => {
         if (event.key === 'Escape') {
            setShowEditModal(false);
         }
      };

      if (showEditModal) {
         window.addEventListener('keydown', handleEsc);
      } else {
         window.removeEventListener('keydown', handleEsc);
      }

      // Limpiar el event listener cuando el componente se desmonte
      return () => {
         window.removeEventListener('keydown', handleEsc);
      };
   }, [showEditModal]);

   const handleEdit = (customerId) => {
      const customerToEdit = customers.find(c => c._id === customerId);
      setSelectedCustomer({ ...customerToEdit }); // Copiar los datos del cliente
      setShowEditModal(true); // Mostrar el modal de edición
   };

   const handleSaveEdit = async () => {
      try {
         const token = Cookies.get('token');
         if (!token) throw new Error('No token found. Please log in.');

         await axios.put(`http://localhost:5000/customer/edit/${selectedCustomer._id}`, selectedCustomer, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         // Actualizar la lista de clientes con el cliente editado
         setCustomers(customers.map(c => (c._id === selectedCustomer._id ? selectedCustomer : c)));
         setShowEditModal(false); // Cerrar el modal
      } catch (error) {
         console.error('Error updating customer:', error);
         Swal.fire('Error', 'Hubo un problema al actualizar el cliente.', 'error');
      }
   };

   const handleDelete = async (customerId) => {
      const result = await Swal.fire({
         title: '¿Estás seguro?',
         text: 'Esta acción no se puede deshacer',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#3085d6',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
         try {
            const token = Cookies.get('token');
            if (!token) throw new Error('No token found. Please log in.');

            await axios.delete(`http://localhost:5000/customer/${customerId}`, {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });

            setCustomers(customers.filter(customer => customer._id !== customerId));

            Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
         } catch (error) {
            console.error('Error deleting customer:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
         }
      }
   };

   if (error) return <div className="alert alert-danger">{error}</div>;

   return (
      <div>
         <h2>Clientes</h2>
         <button 
            onClick={() => navigate('/customer/view-add')} 
            style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
         >
            Crear Nuevo Cliente
         </button>

         <ul>
            {customers.length > 0 ? (
               customers.map(customer => (
                  <li key={customer._id} style={{ listStyle: 'none', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                     <div>
                        <h3>{customer.name} {customer.lastname}</h3>
                        <p>Email: {customer.email}</p>
                        <p>Teléfono: {customer.numberPhone}</p>
                        <p>Status: {customer.active ? 'Activo' : 'Inactivo'}</p>

                        <div style={{ marginTop: '10px' }}>
                           <button 
                              onClick={() => handleEdit(customer._id)} 
                              style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                           >
                              Editar
                           </button>
                           <button 
                              onClick={() => handleDelete(customer._id)} 
                              style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                           >
                              Eliminar
                           </button>
                        </div>
                     </div>
                  </li>
               ))
            ) : (
               <li>No hay clientes activos registrados.</li>
            )}
         </ul>

         {/* Modal de Edición */}
         {showEditModal && selectedCustomer && (
            <div className="modal-overlay" style={modalOverlayStyle}>
               <div className="modal-content" style={modalContentStyle}>
                  <h3>Editar Cliente</h3>
                  <div className="form-group">
                     <label>Nombre</label>
                     <input 
                        type="text" 
                        value={selectedCustomer.name}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                        className="form-control"
                     />
                  </div>
                  <div className="form-group">
                     <label>Apellido</label>
                     <input 
                        type="text" 
                        value={selectedCustomer.lastname}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lastname: e.target.value })}
                        className="form-control"
                     />
                  </div>
                  <div className="form-group">
                     <label>Email</label>
                     <input 
                        type="email" 
                        value={selectedCustomer.email}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                        className="form-control"
                     />
                  </div>
                  <div className="form-group">
                     <label>Teléfono</label>
                     <input 
                        type="text" 
                        value={selectedCustomer.numberPhone}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, numberPhone: e.target.value })}
                        className="form-control"
                     />
                  </div>
                  <button onClick={handleSaveEdit} className="btn btn-primary">Guardar cambios</button>
                  <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancelar</button>
               </div>
            </div>
         )}
      </div>
   );
}

// Estilos para el modal centrado y cuadrado
const modalOverlayStyle = {
   position: 'fixed',
   top: 0,
   left: 0,
   width: '100%',
   height: '100%',
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
   display: 'flex',
   justifyContent: 'center',
   alignItems: 'center',
};

const modalContentStyle = {
   backgroundColor: '#fff',
   padding: '20px',
   borderRadius: '8px',
   width: '400px', // Tamaño cuadrado ajustado
   textAlign: 'center',
};

export default CustomerPage;

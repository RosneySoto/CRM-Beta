import React, { useState, useEffect } from 'react';
import '../styles/createCustomerModal.css';

function CreateCustomerModal({ isOpen, onClose, onSave }) {
   const [name, setName] = useState('');
   const [lastname, setLastname] = useState('');
   const [numberPhone, setNumberPhone] = useState('');
   const [email, setEmail] = useState('');
   const [vehicles, setVehicles] = useState([]);
   const [newVehicle, setNewVehicle] = useState({ marca: '', modelo: '', patente: '' });
   const [editingVehicleIndex, setEditingVehicleIndex] = useState(null); // Nuevo estado

   useEffect(() => {
      if (!isOpen) {
         // Resetear el formulario cuando se cierra el modal
         setName('');
         setLastname('');
         setNumberPhone('');
         setEmail('');
         setVehicles([]);
         setNewVehicle({ marca: '', modelo: '', patente: '' });
         setEditingVehicleIndex(null);
      }
   }, [isOpen]);

   const handleSubmit = (e) => {
      e.preventDefault();
      const customerData = { name, lastname, numberPhone, email, vehicles };
      onSave(customerData);
   };

   const handleAddVehicle = () => {
      if (newVehicle.marca && newVehicle.modelo && newVehicle.patente) {
         if (editingVehicleIndex !== null) {
            // Estamos editando un vehículo existente
            const updatedVehicles = [...vehicles];
            updatedVehicles[editingVehicleIndex] = { ...newVehicle };
            setVehicles(updatedVehicles);
            setEditingVehicleIndex(null);
         } else {
            // Estamos agregando un vehículo nuevo
            setVehicles([...vehicles, newVehicle]);
         }
         setNewVehicle({ marca: '', modelo: '', patente: '' });
      } else {
         alert('Todos los campos del vehículo son obligatorios');
      }
   };

   const handleDeleteVehicle = (index) => {
      setVehicles(vehicles.filter((_, i) => i !== index));
   };

   const handleEditVehicle = (index) => {
      const vehicleToEdit = vehicles[index];
      setNewVehicle({ ...vehicleToEdit });
      setEditingVehicleIndex(index);
   };

   const handleCancelEdit = () => {
      setNewVehicle({ marca: '', modelo: '', patente: '' });
      setEditingVehicleIndex(null);
   };

   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>Crear Cliente</h2>
            <form onSubmit={handleSubmit}>
               <div className="form-container">
                  <div className="form-group">
                     <label htmlFor="name">
                        <i className="fas fa-user"></i> Nombre
                     </label>
                     <div className="input-with-icon">
                        <i className="fas fa-user input-icon"></i>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                     </div>
                  </div>
                  <div className="form-group">
                     <label htmlFor="lastname">
                        <i className="fas fa-user"></i> Apellido
                     </label>
                     <div className="input-with-icon">
                        <i className="fas fa-user input-icon"></i>
                        <input type="text" id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
                     </div>
                  </div>
                  <div className="form-group">
                     <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Correo electrónico
                     </label>
                     <div className="input-with-icon">
                        <i className="fas fa-envelope input-icon"></i>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                     </div>
                  </div>
                  <div className="form-group">
                     <label htmlFor="numberPhone">
                        <i className="fas fa-mobile-alt"></i> Teléfono
                     </label>
                     <div className="input-with-icon">
                        <i className="fas fa-mobile-alt input-icon"></i>
                        <input type="text" id="numberPhone" value={numberPhone} onChange={(e) => setNumberPhone(e.target.value)} required />
                     </div>
                  </div>
               </div>

               {/* Sección de vehículos */}
               <div className="vehicle-section">
                  <h3 className='vehicle-title'>Vehículos</h3>
                  <ul className="vehicle-list">
                     {vehicles.map((vehicle, index) => (
                        <li key={index}>
                           <div>
                              <b>Marca/Modelo: </b>{vehicle.marca} {vehicle.modelo} <b> - Patente: </b>{vehicle.patente}
                           </div>
                           <div>
                              {/* Botones Editar y Eliminar */}
                              <button className='button-edit' type="button" onClick={() => handleEditVehicle(index)}>
                                 <i className="fas fa-edit"></i> Editar
                              </button>
                              <button className='button-delete' type="button" onClick={() => handleDeleteVehicle(index)}>
                                 <i className="fas fa-trash"></i> Eliminar
                              </button>
                           </div>
                        </li>
                     ))}
                  </ul>


                  {/* Agregar nuevo vehículo */}
                  <div className="add-vehicle-form">
                     <div className="input-with-icon">
                        <i className="fas fa-tag input-icon"></i>
                        <input
                           type="text"
                           placeholder="Marca"
                           value={newVehicle.marca}
                           onChange={(e) => setNewVehicle({ ...newVehicle, marca: e.target.value })}
                        />
                     </div>
                     <div className="input-with-icon">
                        <i className="fas fa-car-side input-icon"></i>
                        <input
                           type="text"
                           placeholder="Modelo"
                           value={newVehicle.modelo}
                           onChange={(e) => setNewVehicle({ ...newVehicle, modelo: e.target.value })}
                        />
                     </div>
                     <div className="input-with-icon">
                        <i className="fas fa-id-card input-icon"></i>
                        <input
                           type="text"
                           placeholder="Patente"
                           value={newVehicle.patente}
                           onChange={(e) => setNewVehicle({ ...newVehicle, patente: e.target.value })}
                        />
                     </div>
                  </div>
                  
                  <div className="vehicle-buttons">
                     <button type="button" onClick={handleAddVehicle}>
                        {editingVehicleIndex !== null ? (
                           <>
                              <i className="fas fa-save"></i> Actualizar Vehículo
                           </>
                        ) : (
                           <>
                              <i className="fas fa-plus"></i> Agregar Vehículo
                           </>
                        )}
                     </button>
                     
                     {editingVehicleIndex !== null && (
                        <button type="button" className="btn-cancel-edit" onClick={handleCancelEdit}>
                           <i className="fas fa-times"></i> Cancelar Edición
                        </button>
                     )}
                  </div>

               </div>

               <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">Crear Cliente</button>
                  <button type="button" className="btn btn-danger" onClick={onClose}>Cancelar</button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default CreateCustomerModal;

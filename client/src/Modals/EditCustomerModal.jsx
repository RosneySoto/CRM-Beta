import React, { useState, useEffect } from 'react';
import '../styles/editCustomerModal.css';

function EditCustomerModal({ isOpen, onClose, onSave, customerData }) {
   const [name, setName] = useState('');
   const [lastname, setLastname] = useState('');
   const [numberPhone, setNumberPhone] = useState('');
   const [email, setEmail] = useState('');
   const [vehicles, setVehicles] = useState([]);
   const [newVehicle, setNewVehicle] = useState({ marca: '', modelo: '', patente: '' });

   useEffect(() => {
      if (customerData) {
         setName(customerData.name);
         setLastname(customerData.lastname);
         setNumberPhone(customerData.numberPhone);
         setEmail(customerData.email);
         setVehicles(customerData.vehicles || []);
      }
   }, [customerData]);

   const handleSubmit = (e) => {
      e.preventDefault();
      const updatedCustomerData = { name, lastname, numberPhone, email, vehicles };
      onSave(updatedCustomerData);
   };

   const handleAddVehicle = () => {
      if (newVehicle.marca && newVehicle.modelo && newVehicle.patente) {
         setVehicles([...vehicles, newVehicle]);
         setNewVehicle({ marca: '', modelo: '', patente: '' }); // Reset fields after adding vehicle
      } else {
         alert("Por favor, complete todos los campos del vehículo.");
      }
   };

   const handleDeleteVehicle = (index) => {
      const updatedVehicles = vehicles.filter((_, i) => i !== index);
      setVehicles(updatedVehicles);
   };

   const handleEditVehicle = (index) => {
      const vehicleToEdit = vehicles[index];
      setNewVehicle(vehicleToEdit); // Pre-fill the new vehicle form with the selected vehicle's data
      handleDeleteVehicle(index);  // Delete the selected vehicle from the list (optional)
   };

   // Reset form fields when closing the modal
   const handleClose = () => {
      setName('');
      setLastname('');
      setNumberPhone('');
      setEmail('');
      setVehicles([]);
      setNewVehicle({ marca: '', modelo: '', patente: '' });
      onClose();
   };

   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>Editar Cliente</h2>
            <form onSubmit={handleSubmit}>
               <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
               </div>
               <div className="form-group">
                  <label htmlFor="lastname">Apellido</label>
                  <input type="text" id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
               </div>
               <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
               </div>
               <div className="form-group">
                  <label htmlFor="numberPhone">Teléfono</label>
                  <input type="text" id="numberPhone" value={numberPhone} onChange={(e) => setNumberPhone(e.target.value)} required />
               </div>

               {/* Sección de vehículos */}
               <div className="vehicle-section">
                  <h3 className='vehicle-title'>Vehículos</h3>
                  <ul>
                     {vehicles.map((vehicle, index) => (
                        <li key={index}>
                           <b>Marca/Modelo: </b>{vehicle.marca} {vehicle.modelo} <b> - Patente: </b>{vehicle.patente}

                           {/* Botones Editar y Eliminar */}
                           <button className='button-edit' type="button" onClick={() => handleEditVehicle(index)}>Editar</button>
                           <button className='button-delete' type="button" onClick={() => handleDeleteVehicle(index)}>Eliminar</button>

                        </li>
                     ))}
                  </ul>


                  {/* Agregar nuevo vehículo */}
                  <div className="add-vehicle-form">
                     <input
                        type="text"
                        placeholder="Marca"
                        value={newVehicle.marca}
                        onChange={(e) => setNewVehicle({ ...newVehicle, marca: e.target.value })}
                     />
                     <input
                        type="text"
                        placeholder="Modelo"
                        value={newVehicle.modelo}
                        onChange={(e) => setNewVehicle({ ...newVehicle, modelo: e.target.value })}
                     />
                     <input
                        type="text"
                        placeholder="Patente"
                        value={newVehicle.patente}
                        onChange={(e) => setNewVehicle({ ...newVehicle, patente: e.target.value })}
                     />
                  </div>
                  <button type="button" onClick={handleAddVehicle}>Agregar Vehículo</button>

               </div>

               <button type="submit" className="btn btn-primary">Guardar Cambios</button>
               <button type="button" className="btn btn-danger" onClick={handleClose}>Cancelar</button>
            </form>
         </div>
      </div>
   );
}

export default EditCustomerModal;

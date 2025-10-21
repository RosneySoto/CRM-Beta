import React, { useState, useEffect } from 'react';
import '../styles/createCustomerModal.css'

function CreateCustomerModal({ isOpen, onClose, onSave }) {
   const [name, setName] = useState('');
   const [lastname, setLastname] = useState('');
   const [numberPhone, setNumberPhone] = useState('');
   const [email, setEmail] = useState('');
   const [vehicles, setVehicles] = useState([]);
   const [vehicleForm, setVehicleForm] = useState({ marca: '', modelo: '', patente: '' });

   useEffect(() => {
      if (!isOpen) {
         // Resetear el formulario cuando se cierra el modal
         setName('');
         setLastname('');
         setNumberPhone('');
         setEmail('');
         setVehicles([]);
         setVehicleForm({ marca: '', modelo: '', patente: '' });
      }
   }, [isOpen]);

   const handleSubmit = (e) => {
      e.preventDefault();
      const customerData = { name, lastname, numberPhone, email, vehicles };
      onSave(customerData);
   };

   const handleVehicleChange = (e) => {
      const { name, value } = e.target;
      setVehicleForm({ ...vehicleForm, [name]: value });
   };

   const addVehicle = () => {
      if (!vehicleForm.marca || !vehicleForm.modelo || !vehicleForm.patente) {
         alert('Todos los campos del vehículo son obligatorios');
         return;
      }

      setVehicles([...vehicles, vehicleForm]);
      setVehicleForm({ marca: '', modelo: '', patente: '' });
   };

   const removeVehicle = (index) => {
      setVehicles(vehicles.filter((_, i) => i !== index));
   };

   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>Crear Cliente</h2>
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
                  <hr></hr>   
                  <h3 className='title-vehicles'>Vehículos</h3>
                  <ul>
                     {vehicles.map((vehicle, index) => (
                        <li key={index}>
                           {vehicle.marca} {vehicle.modelo} - {vehicle.patente}
                           <button type="button" onClick={() => removeVehicle(index)}>Eliminar</button>
                        </li>
                     ))}
                  </ul>

                  <div className="vehicle-form">
                     <div className="form-group">
                        <label htmlFor="brand">Marca</label>
                        <input type="text" name="marca" value={vehicleForm.marca} onChange={handleVehicleChange} />
                     </div>
                     <div className="form-group">
                        <label htmlFor="model">Modelo</label>
                        <input type="text" name="modelo" value={vehicleForm.modelo} onChange={handleVehicleChange} />
                     </div>
                     <div className="form-group">
                        <label htmlFor="licensePlate">Patente</label>
                        <input type="text" name="patente" value={vehicleForm.patente} onChange={handleVehicleChange} />
                     </div>
                     <button type="button" className="add-vehicle-btn" onClick={addVehicle}>+</button>
                     <button type="button" onClick={addVehicle}>Agregar Vehículo</button>
                  </div>
               </div>

               <button type="submit" className="btn btn-primary">Crear Cliente</button>
               <button type="button" className="btn btn-danger" onClick={onClose}>Cancelar</button>
            </form>
         </div>
      </div>
   );
}

export default CreateCustomerModal;

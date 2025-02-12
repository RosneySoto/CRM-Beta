import React, { useState } from 'react';
import '../styles/customerModal.css'; // Si tienes un archivo CSS para el modal

function CustomerModal({ isOpen, onClose, onSave, customerData }) {
   const [name, setName] = useState(customerData ? customerData.name : '');
   const [lastname, setLastname] = useState(customerData ? customerData.lastname : '');
   const [numberPhone, setNumberPhone] = useState(customerData ? customerData.numberPhone : '');

   // Función para manejar el envío del formulario
   const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ name, lastname, numberPhone }); // Llama a la función de guardar pasándole los datos
   };

   if (!isOpen) return null; // Si el modal no está abierto, no se renderiza nada

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>{customerData ? 'Editar Cliente' : 'Crear Cliente'}</h2>
            <form onSubmit={handleSubmit}>
               <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input
                     type="text"
                     id="name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="lastname">Apellido</label>
                  <input
                     type="text"
                     id="lastname"
                     value={lastname}
                     onChange={(e) => setLastname(e.target.value)}
                     required
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="numberPhone">Teléfono</label>
                  <input
                     type="text"
                     id="numberPhone"
                     value={numberPhone}
                     onChange={(e) => setNumberPhone(e.target.value)}
                     required
                  />
               </div>
               <button type="submit" className="btn btn-primary">
                  {customerData ? 'Guardar cambios' : 'Crear cliente'}
               </button>
               <button type="button" className="btn btn-danger" onClick={onClose}>
                  Cancelar
               </button>
            </form>
         </div>
      </div>
   );
}

export default CustomerModal;

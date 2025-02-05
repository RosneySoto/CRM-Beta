import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function CreateCustomerPage() {
   const [name, setName] = useState('');
   const [lastname, setLastname] = useState('');
   const [image, setImage] = useState('');
   const [numberPhone, setNumberPhone] = useState('');
   const [vehicles, setVehicles] = useState([{ marca: '', modelo: '', patente: '' }]);
   const [error, setError] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchCreateCustomer = async () => {
         try {
            // Obtén el token de las cookies
            const token = Cookies.get('token');
            if (!token) {
               throw new Error('No token found. Please log in.');
            }
            // Decodifica el token
            const decodedToken = jwtDecode(token);

            // Realiza la solicitud a la API con el token en el encabezado
            const response = await axios.get('http://localhost:5000/customer/view-add', {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
            console.log("Response: ", response);

         } catch (error) {
            setError(error.response ? error.response.data : 'An error occurred');
         }
      };

      fetchCreateCustomer();
   }, [navigate]);

   const handleAddVehicle = () => {
      setVehicles([...vehicles, { marca: '', modelo: '', patente: '' }]);
   };

   const handleVehicleChange = (index, event) => {
      const newVehicles = vehicles.map((vehicle, i) => {
         if (i === index) {
            return { ...vehicle, [event.target.name]: event.target.value };
         }
         return vehicle;
      });
      setVehicles(newVehicles);
   };

   const handleSubmit = async (event) => {
      event.preventDefault();
      try {
         const token = Cookies.get('token');
         if (!token) {
            throw new Error('No token found. Please log in.');
         }

         const response = await axios.post('http://localhost:5000/customer', {
            name,
            lastname,
            image,
            numberPhone,
            vehicles
         }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });
         console.log('RESPONSE ', response);
         

         navigate('/customer');
      } catch (error) {
         setError(error.response ? error.response.data.message : 'An error occurred');
      }
   };

   // Función para manejar el cancelado
   const handleCancel = () => {
      navigate('/customer');
   };

   if (error) {
      return <div className="alert alert-danger">{error}</div>;
   }

   return (
      <div className="container">
         <h2>Create New Customer</h2>
         {error && <div className="alert alert-danger">{error}</div>}
         <form onSubmit={handleSubmit}>
            <div className="form-group">
               <label htmlFor="name">Name</label>
               <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label htmlFor="lastname">Lastname</label>
               <input
                  type="text"
                  className="form-control"
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label htmlFor="image">Image URL</label>
               <input
                  type="text"
                  className="form-control"
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label htmlFor="numberPhone">Number Phone</label>
               <input
                  type="text"
                  className="form-control"
                  id="numberPhone"
                  value={numberPhone}
                  onChange={(e) => setNumberPhone(e.target.value)}
                  required
               />
            </div>
            <h3>Vehicles</h3>
            {vehicles.map((vehicle, index) => (
               <div key={index} className="form-group">
                  <label>Vehicle {index + 1}</label>
                  <input
                     type="text"
                     className="form-control"
                     name="marca"
                     placeholder="Marca"
                     value={vehicle.marca}
                     onChange={(e) => handleVehicleChange(index, e)}
                     required
                  />
                  <input
                     type="text"
                     className="form-control"
                     name="modelo"
                     placeholder="Modelo"
                     value={vehicle.modelo}
                     onChange={(e) => handleVehicleChange(index, e)}
                     required
                  />
                  <input
                     type="text"
                     className="form-control"
                     name="patente"
                     placeholder="Patente"
                     value={vehicle.patente}
                     onChange={(e) => handleVehicleChange(index, e)}
                     required
                  />
               </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={handleAddVehicle}>
               Add Vehicle
            </button>
            <button type="submit" className="btn btn-primary">
               Create Customer
            </button>
            {/* Botón de cancelación */}
            <button type="button" className="btn btn-danger" onClick={handleCancel}>
               Cancelar
            </button>
         </form>
      </div>
   );
}

export default CreateCustomerPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import '../styles/createOrderBuyModal.css'

function OrderModal({ isOpen, onClose, onOrderCreated }) {
   const [formData, setFormData] = useState({
      product: "",
      price: "",
      customerId: "",
      vehicle: "",
   });

   const [products, setProducts] = useState([]);
   const [customers, setCustomers] = useState([]);
   const [vehicles, setVehicles] = useState([]); // Nueva variable de estado

   useEffect(() => {
      const fetchData = async () => {
         try {
            const token = Cookies.get("token");
            if (!token) throw new Error("No token found. Please log in.");

            // Fetch products
            const responseProducts = await axios.get("http://localhost:5000/product/allProducts", {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
            console.log('Productos recibidos:', responseProducts.data);            

            if (Array.isArray(responseProducts.data.data)) {
               setProducts(responseProducts.data.data);
            } else {
               console.error( "La respuesta de productos no es un arreglo:", responseProducts.data);
            }

            // Fetch customers
            const responseCustomers = await axios.get("http://localhost:5000/customer/all", {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });
            // console.log("Clientes recibidos:", responseCustomers.data);      

            if (Array.isArray(responseCustomers.data)) {
               setCustomers(responseCustomers.data);
            } else {
               console.error("La respuesta de clientes no es un arreglo:", responseCustomers.data);
            }
         } catch (error) {
            console.error("Error fetching data", error);
         }
      };


      if (isOpen) fetchData();
   }, [isOpen]);

   useEffect(() => {
      if (!formData.customerId) {
         setVehicles([]);
         return;
      }

      const selectedCustomer = customers.find((customer) => customer._id === formData.customerId);

      if (selectedCustomer) {
         console.log("Cliente seleccionado:", selectedCustomer);
         console.log("Vehículos asociados:", selectedCustomer.vehicles);

         // Validar que `vehicles` es un array antes de actualizar el estado
         if (Array.isArray(selectedCustomer.vehicles)) {
            setVehicles(selectedCustomer.vehicles);
         } else {
            console.error("El cliente no tiene un array de vehículos:", selectedCustomer.vehicles);
            setVehicles([]);
         }
      } else {
         console.log("No se encontró el cliente en la lista.");
         setVehicles([]);
      }
   }, [formData.customerId, customers]);


   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleProductChange = (e) => {
      const selectedProductId = e.target.value;
      const selectedProduct = products.find((prod) => prod._id === selectedProductId);
   
      setFormData((prev) => ({
         ...prev,
         product: selectedProductId,
         price: selectedProduct ? selectedProduct.price.$numberDecimal : "", // ✅ Accediendo correctamente al valor numérico
      }));
   };
   

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         console.log('ENVIO DE L POST', formData) // Recibe el objeto con los datos del formulario
         await axios.post(
            "http://localhost:5000/order",
            {
               nameService: formData.product, // Asegúrate de que `formData.product` sea el valor correcto
               customerId: formData.customerId,
               createUserId: formData.createUserId,  // Verifica que este campo esté presente
               vehicleId: formData.vehicle // Verifica que este campo esté presente
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               withCredentials: true,
            }
         );


         onOrderCreated();
         onClose();
      } catch (error) {
         console.error("Error creating order:", error);
      }
   };

   // console.log("Clientes disponibles en estado:", customers)


   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>Create New Order</h2>
            <form onSubmit={handleSubmit}>
               <div className="form-row">
                  <label>
                     Product:
                     <select name="product" value={formData.product} onChange={handleProductChange} required>
                        <option value="">Select a product</option>
                        {products.map((product) => (
                           <option key={product._id} value={product._id}>
                              {product.product}
                           </option>
                        ))}
                     </select>
                  </label>

                  <label>
                     Price:
                     <input readOnly type="number" value={formData.price ? parseFloat(formData.price) : ''} />
                  </label>
               </div>

               <div className="form-row">
                  <label>
                     Customer:
                     <select name="customerId" value={formData.customerId} onChange={handleChange} required>
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                           <option key={customer._id} value={customer._id}>
                              {customer.name}
                           </option>
                        ))}
                     </select>
                  </label>

                  <label>
                     Vehicle:
                     <select name="vehicle" value={formData.vehicle} onChange={handleChange} required>
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                           <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.marca} {vehicle.modelo} ({vehicle.patente}){vehicle.model}
                           </option>
                        ))}
                     </select>
                  </label>
               </div>

               <div className="modal-actions">
                  <button type="submit">Create Order</button>
                  <button type="button" onClick={onClose}>
                     Cancel
                  </button>
               </div>
            </form>

         </div>
      </div>
   );
}

export default OrderModal;

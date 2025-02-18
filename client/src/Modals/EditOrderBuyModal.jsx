import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

function EditOrderModal({ isOpen, onClose, onOrderUpdated, selectedOrder, products }) {
   const [formData, setFormData] = useState({
      product: "",
      price: "",
      customerId: "",
      vehicle: "",
      customerName: "",
      vehicleMarca: "",
      vehicleModelo: "",
      vehiclePatente: "",
   });

   const [customers, setCustomers] = useState([]);
   const [vehicles, setVehicles] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const token = Cookies.get("token");
            if (!token) throw new Error("No token found. Please log in.");

            const responseCustomers = await axios.get("http://localhost:5000/customer/all", {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
            });

            if (Array.isArray(responseCustomers.data)) {
               setCustomers(responseCustomers.data);
            } else {
               console.error("La respuesta de clientes no es un arreglo:", responseCustomers.data);
            }

            // console.log("Products received in EditOrderModal:", products);

            if (selectedOrder) {
               const product = selectedOrder.nameService || {};
               const customer = selectedOrder.customerId || {};
               const vehicle = selectedOrder.vehicle || {};

               setFormData({
                  product: product._id || "",
                  price: product.price?.$numberDecimal || "",
                  customerId: customer._id || "",
                  vehicle: vehicle._id || "",
               });
            }
         } catch (error) {
            console.error("Error fetching data", error);
         }
      };

      if (isOpen) fetchData();
   }, [isOpen, selectedOrder]);

   useEffect(() => {
      if (!formData.customerId) {
         setVehicles([]);
         return;
      }

      const selectedCustomer = customers.find((customer) => customer._id === formData.customerId);

      if (selectedCustomer) {
         if (Array.isArray(selectedCustomer.vehicles)) {
            setVehicles(selectedCustomer.vehicles);
         } else {
            setVehicles([]);
         }
      } else {
         setVehicles([]);
      }
   }, [formData.customerId, customers]);

   // Agregar el evento para detectar la tecla "Escape"
   useEffect(() => {
      const handleKeyDown = (event) => {
         if (event.key === "Escape") {
            handleClose();
         }
      };

      if (isOpen) {
         window.addEventListener("keydown", handleKeyDown);
      }

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
      };
   }, [isOpen]);

   const handleClose = () => {
      setFormData({
         product: "",
         price: "",
         customerId: "",
         vehicle: "",
         customerName: "",
         vehicleMarca: "",
         vehicleModelo: "",
         vehiclePatente: "",
      });
      onClose();
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleProductChange = (e) => {
      const selectedProductId = e.target.value;
      const selectedProduct = products.data.find((prod) => prod._id === selectedProductId);

      // console.log("Selected product:", selectedProduct);

      setFormData((prev) => ({
         ...prev,
         product: selectedProductId,
         price: selectedProduct ? selectedProduct.price.$numberDecimal : "",
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         await axios.put(
            `http://localhost:5000/order/${selectedOrder._id}`,
            {
               nameService: formData.product,
               customerId: formData.customerId,
               vehicleId: formData.vehicle,
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               withCredentials: true,
            }
         );

         onOrderUpdated();
         handleClose();
      } catch (error) {
         console.error("Error updating order:", error);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>Edit Order</h2>
            <form onSubmit={handleSubmit}>
               <div className="form-row">
                  <label>
                     Product:
                     <select name="product" value={formData.product} onChange={handleProductChange} required>
                        <option value="">Select a product</option>
                        {Array.isArray(products.data) && products.data.map((product) => (
                           <option key={product._id} value={product._id}>
                              {product.product}
                           </option>
                        ))}
                     </select>
                  </label>

                  <label>
                     Price:
                     <input readOnly type="number" value={formData.price ? parseFloat(formData.price) : ""} />
                  </label>
               </div>

               <div className="form-row">
                  <label>
                     Customer:
                     <select name="customerId" value={formData.customerId} onChange={handleChange} required>
                        <option value="">Select a customer</option>
                        {Array.isArray(customers) && customers.map((customer) => (
                           <option key={customer._id} value={customer._id}>
                              {customer.name} {customer.lastname}
                           </option>
                        ))}
                     </select>
                  </label>

                  <label>
                     Vehicle:
                     <select name="vehicle" value={formData.vehicle} onChange={handleChange} required>
                        <option value="">Select a vehicle</option>
                        {Array.isArray(vehicles) && vehicles.map((vehicle) => (
                           <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.marca} {vehicle.modelo} ({vehicle.patente})
                           </option>
                        ))}
                     </select>
                  </label>
               </div>

               <div className="modal-actions">
                  <button type="submit">Update Order</button>
                  <button type="button" onClick={handleClose}>
                     Cancel
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default EditOrderModal;

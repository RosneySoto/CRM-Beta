import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import '../styles/createOrderBuyModal.css';

function CreateOrderBuyModal({ isOpen, onClose, onOrderCreated, products: initialProducts }) {
   const [formData, setFormData] = useState({
      product: "",
      customerId: "",
      vehicleId: "",
   });

   const [products, setProducts] = useState([]);
   const [customers, setCustomers] = useState([]);
   const [vehicles, setVehicles] = useState([]);
   const [selectedProduct, setSelectedProduct] = useState(null);
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState({});

   useEffect(() => {
      if (isOpen) {
         fetchData();
         resetForm();
      }
   }, [isOpen]);

   const resetForm = () => {
      setFormData({
         product: "",
         customerId: "",
         vehicleId: "",
      });
      setSelectedProduct(null);
      setVehicles([]);
      setErrors({});
   };

   const fetchData = async () => {
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         // Fetch products
         const responseProducts = await axios.get("http://localhost:5000/product/allProducts", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         if (Array.isArray(responseProducts.data.data)) {
            setProducts(responseProducts.data.data);
         }

         // Fetch customers
         const responseCustomers = await axios.get("http://localhost:5000/customer/all", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         if (Array.isArray(responseCustomers.data)) {
            setCustomers(responseCustomers.data);
         }
      } catch (error) {
         console.error("Error fetching data", error);
      }
   };

   useEffect(() => {
      if (!formData.customerId) {
         setVehicles([]);
         return;
      }

      const selectedCustomer = customers.find((customer) => customer._id === formData.customerId);

      if (selectedCustomer && Array.isArray(selectedCustomer.vehicles)) {
         setVehicles(selectedCustomer.vehicles);
         // Reset vehicle selection when customer changes
         setFormData(prev => ({ ...prev, vehicleId: "" }));
      } else {
         setVehicles([]);
      }
   }, [formData.customerId, customers]);

   const handleProductChange = (e) => {
      const selectedProductId = e.target.value;
      const product = products.find((prod) => prod._id === selectedProductId);

      setFormData((prev) => ({
         ...prev,
         product: selectedProductId,
      }));
      setSelectedProduct(product);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));

      // Clear errors when user starts typing
      if (errors[name]) {
         setErrors(prev => ({ ...prev, [name]: "" }));
      }
   };

   const validateForm = () => {
      const newErrors = {};

      if (!formData.product) newErrors.product = "Debe seleccionar un servicio";
      if (!formData.customerId) newErrors.customerId = "Debe seleccionar un cliente";
      if (!formData.vehicleId) newErrors.vehicleId = "Debe seleccionar un vehículo";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      setLoading(true);
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         await axios.post(
            "http://localhost:5000/order",
            {
               nameService: formData.product,
               customerId: formData.customerId,
               vehicleId: formData.vehicleId,
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
         setErrors({ submit: "Error al crear la orden. Inténtalo nuevamente." });
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <div className="modal-header">
               <h2>
                  <i className="fas fa-plus-circle"></i>
                  Crear Nueva Orden
               </h2>
               <button className="close-btn" onClick={onClose} title="Cerrar">
                  <i className="fas fa-times"></i>
               </button>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
               {/* Servicio y Precio */}
               <div className="form-section">
                  <h3><i className="fas fa-concierge-bell"></i> Servicio</h3>
                  <div className="form-group">
                     <label htmlFor="product">
                        <i className="fas fa-list"></i> Servicio
                     </label>
                     <select
                        id="product"
                        name="product"
                        value={formData.product}
                        onChange={handleProductChange}
                        className={errors.product ? 'error' : ''}
                     >
                        <option value="">Seleccionar servicio</option>
                        {products.map((product) => (
                           <option key={product._id} value={product._id}>
                              {product.product}
                           </option>
                        ))}
                     </select>
                     {errors.product && <span className="error-message">{errors.product}</span>}
                  </div>

                  {selectedProduct && (
                     <div className="price-display">
                        <label>Precio:</label>
                        <div className="price-value">
                           ${parseFloat(selectedProduct.price?.$numberDecimal || 0).toFixed(2)}
                        </div>
                     </div>
                  )}
               </div>

               {/* Cliente */}
               <div className="form-section">
                  <h3><i className="fas fa-user"></i> Cliente</h3>
                  <div className="form-group">
                     <label htmlFor="customerId">
                        <i className="fas fa-users"></i> Seleccionar Cliente
                     </label>
                     <select
                        id="customerId"
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleChange}
                        className={errors.customerId ? 'error' : ''}
                     >
                        <option value="">Seleccionar cliente</option>
                        {customers.map((customer) => (
                           <option key={customer._id} value={customer._id}>
                              {customer.name} {customer.lastname}
                           </option>
                        ))}
                     </select>
                     {errors.customerId && <span className="error-message">{errors.customerId}</span>}
                  </div>
               </div>

               {/* Vehículo */}
               <div className="form-section">
                  <h3><i className="fas fa-car"></i> Vehículo</h3>
                  <div className="form-group">
                     <label htmlFor="vehicleId">
                        <i className="fas fa-car-side"></i> Seleccionar Vehículo
                     </label>
                     <select
                        id="vehicleId"
                        name="vehicleId"
                        value={formData.vehicleId}
                        onChange={handleChange}
                        disabled={!formData.customerId || vehicles.length === 0}
                        className={errors.vehicleId ? 'error' : ''}
                     >
                        <option value="">
                           {!formData.customerId ? "Primero selecciona un cliente" : "Seleccionar vehículo"}
                        </option>
                        {vehicles.map((vehicle) => (
                           <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.marca} {vehicle.modelo} - {vehicle.patente}
                           </option>
                        ))}
                     </select>
                     {errors.vehicleId && <span className="error-message">{errors.vehicleId}</span>}
                  </div>
               </div>

               {errors.submit && (
                  <div className="error-message submit-error">
                     {errors.submit}
                  </div>
               )}

               <div className="modal-actions">
                  <button
                     type="button"
                     className="btn-secondary"
                     onClick={onClose}
                     disabled={loading}
                  >
                     <i className="fas fa-times"></i> Cancelar
                  </button>
                  <button
                     type="submit"
                     className="btn-primary"
                     disabled={loading}
                  >
                     {loading ? (
                        <>
                           <i className="fas fa-spinner fa-spin"></i> Creando...
                        </>
                     ) : (
                        <>
                           <i className="fas fa-plus"></i> Crear Orden
                        </>
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default CreateOrderBuyModal;

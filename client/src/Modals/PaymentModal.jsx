import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import '../styles/paymentModal.css';
import Swal from 'sweetalert2';

function PaymentModal({ isOpen, onClose, onPaymentCompleted, selectedOrder }) {
   const [paymentMethod, setPaymentMethod] = useState('');
   const [loading, setLoading] = useState(false);

   const handlePayment = async () => {
      if (!paymentMethod) {
         Swal.fire('Error', 'Por favor selecciona un método de pago', 'error');
         return;
      }

      setLoading(true);
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         await axios.post(
            `http://localhost:5000/payment/${selectedOrder._id}`,
            {
               paymentMethod: paymentMethod
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               withCredentials: true,
            }
         );

         Swal.fire('¡Cobro realizado!', 'El pago ha sido procesado correctamente', 'success');
         onPaymentCompleted();
         onClose();
      } catch (error) {
         console.error("Error processing payment:", error);
         Swal.fire('Error', 'No se pudo procesar el pago. Inténtalo nuevamente.', 'error');
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="modal-overlay">
         <div className="modal-content">
            <h2>Procesar Cobro</h2>
            
            <div className="payment-info">
               <div className="order-details">
                  <h3>Detalles de la Orden</h3>
                  <p><strong>Servicio:</strong> {selectedOrder?.nameService?.product}</p>
                  <p><strong>Cliente:</strong> {selectedOrder?.customerId?.name} {selectedOrder?.customerId?.lastname}</p>
                  <p><strong>Vehículo:</strong> {selectedOrder?.vehicle?.marca} {selectedOrder?.vehicle?.modelo} - {selectedOrder?.vehicle?.patente}</p>
                  <p><strong>Monto:</strong> ${parseFloat(selectedOrder?.nameService?.price?.$numberDecimal || 0).toFixed(2)}</p>
               </div>
            </div>

            <div className="payment-method">
               <label>
                  Método de Pago:
                  <select 
                     value={paymentMethod} 
                     onChange={(e) => setPaymentMethod(e.target.value)}
                     required
                  >
                     <option value="">Selecciona un método</option>
                     <option value="CASH">Efectivo</option>
                     <option value="CARD">Tarjeta</option>
                     <option value="TRANSFER">Transferencia</option>
                  </select>
               </label>
            </div>

            <div className="modal-actions">
               <button 
                  type="button" 
                  onClick={handlePayment}
                  disabled={loading || !paymentMethod}
               >
                  {loading ? 'Procesando...' : 'Confirmar Cobro'}
               </button>
               <button type="button" onClick={onClose} disabled={loading}>
                  Cancelar
               </button>
            </div>
         </div>
      </div>
   );
}

export default PaymentModal;
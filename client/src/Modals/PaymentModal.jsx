import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import '../styles/paymentModal.css';
import Swal from 'sweetalert2';

function PaymentModal({ isOpen, onClose, onPaymentCompleted, selectedOrder }) {
   const [paymentMethod, setPaymentMethod] = useState('');
   const [sendEmail, setSendEmail] = useState(false);
   const [generatePDF, setGeneratePDF] = useState(false);
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

         const response = await axios.post(
            `http://localhost:5000/payment/${selectedOrder._id}`,
            {
               paymentMethod: paymentMethod,
               sendEmail: sendEmail,
               generatePDF: generatePDF
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               withCredentials: true,
               responseType: generatePDF ? 'blob' : 'json' // Si se genera PDF, esperar blob
            }
         );

         let successMessage = 'El pago ha sido procesado correctamente';
         let result = null;

         // Si se generó PDF, la respuesta es un blob, descargar automáticamente
         if (generatePDF && response.headers['content-type'] === 'application/pdf') {
            // Crear descarga automática del PDF
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            const invoiceNumber = response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || `Factura_${Date.now()}.pdf`;
            link.href = url;
            link.setAttribute('download', invoiceNumber);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            successMessage += '\n\n✅ PDF descargado automáticamente';

            // Si también se envió email, mostrar ese resultado
            if (sendEmail) {
               successMessage += '\n✅ Factura enviada por email';
            }
         } else {
            // Respuesta normal JSON
            result = response.data?.message;

            if (result?.emailResult || result?.pdfResult) {
               successMessage += '\n\n';
               if (result.emailResult?.emailSent) {
                  successMessage += '✅ Factura enviada por email\n';
               } else if (sendEmail) {
                  successMessage += '❌ Error al enviar email\n';
               }
               if (result.pdfResult?.pdfGenerated) {
                  successMessage += '✅ PDF generado';
               } else if (generatePDF) {
                  successMessage += '❌ Error al generar PDF';
               }
            }
         }

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

            <div className="invoice-options">
               <h3>Opciones de Factura</h3>
               <div className="option-checkboxes">
                  <label className="checkbox-option">
                     <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        disabled={loading}
                     />
                     <span className="checkmark"></span>
                     <i className="fas fa-envelope"></i>
                     Enviar factura por email al cliente
                  </label>

                  <label className="checkbox-option">
                     <input
                        type="checkbox"
                        checked={generatePDF}
                        onChange={(e) => setGeneratePDF(e.target.checked)}
                        disabled={loading}
                     />
                     <span className="checkmark"></span>
                     <i className="fas fa-file-pdf"></i>
                     Generar PDF de la factura
                  </label>
               </div>

               {(sendEmail || generatePDF) && (
                  <div className="invoice-preview">
                     <p className="preview-text">
                        <i className="fas fa-info-circle"></i>
                        La factura incluirá toda la información del cliente, servicio y vehículo.
                     </p>
                  </div>
               )}
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
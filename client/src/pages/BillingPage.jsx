import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "../styles/billing.css";
import Swal from 'sweetalert2';

function BillingPage() {
   const [invoices, setInvoices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [filterStatus, setFilterStatus] = useState('all');
   const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
      fetchInvoices();
   }, []);

   const fetchInvoices = async () => {
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         const response = await axios.get("http://localhost:5000/payment/dashboard/sales", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         setInvoices(response.data.sales || []);
      } catch (err) {
         setError("Error fetching invoices");
      } finally {
         setLoading(false);
      }
   };

   const handleSendEmail = async (invoice) => {
      const result = await Swal.fire({
         title: 'Enviar Factura por Email',
         text: `¿Enviar la factura ${invoice.id} al cliente ${invoice.customer}?`,
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: '#3498db',
         cancelButtonColor: '#95a5a6',
         confirmButtonText: 'Sí, enviar',
         cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
         try {
            const token = Cookies.get("token");
            if (!token) throw new Error("No token found. Please log in.");

            await axios.post(
               `http://localhost:5000/payment/${invoice.id}/send-email`,
               {},
               {
                  headers: { Authorization: `Bearer ${token}` },
                  withCredentials: true,
               }
            );

            Swal.fire('¡Enviado!', 'La factura ha sido enviada por email correctamente.', 'success');
         } catch (error) {
            console.error("Error sending email:", error);
            Swal.fire('Error', 'No se pudo enviar el email. Inténtalo nuevamente.', 'error');
         }
      }
   };

   const handleDownloadPDF = async (invoice) => {
      try {
         const token = Cookies.get("token");
         if (!token) throw new Error("No token found. Please log in.");

         const response = await axios.get(
            `http://localhost:5000/payment/${invoice.id}/pdf`,
            {
               headers: { Authorization: `Bearer ${token}` },
               withCredentials: true,
               responseType: 'blob'
            }
         );

         // Crear un enlace para descargar el archivo
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `Factura_${invoice.id}.pdf`);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);

         Swal.fire('¡Descargado!', 'El PDF ha sido descargado correctamente.', 'success');
      } catch (error) {
         console.error("Error downloading PDF:", error);
         Swal.fire('Error', 'No se pudo descargar el PDF. Inténtalo nuevamente.', 'error');
      }
   };

   const getFilteredInvoices = () => {
      let filtered = invoices;

      // Filtrar por término de búsqueda
      if (searchTerm) {
         filtered = filtered.filter(invoice =>
            invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.id.toString().includes(searchTerm)
         );
      }

      // Filtrar por método de pago
      switch (filterStatus) {
         case 'cash':
            return filtered.filter(invoice => invoice.paymentMethod === 'CASH');
         case 'card':
            return filtered.filter(invoice => invoice.paymentMethod === 'CARD');
         case 'transfer':
            return filtered.filter(invoice => invoice.paymentMethod === 'TRANSFER');
         case 'all':
         default:
            return filtered;
      }
   };

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-AR', {
         style: 'currency',
         currency: 'ARS'
      }).format(amount);
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-AR', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   if (loading && invoices.length === 0) return <p className="loading-text">Cargando facturas...</p>;
   if (error) return <p className="error-text">{error}</p>;

   return (
      <div className="billing-container">
         <h2>
            <i className="fas fa-file-invoice-dollar"></i> Gestión de Facturas
         </h2>

         {/* Controles de filtro y búsqueda */}
         <div className="billing-controls">
            <div className="filter-section">
               <h3>Filtros</h3>
               <div className="filter-buttons">
                  <button
                     className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                     onClick={() => setFilterStatus('all')}
                  >
                     Todas ({invoices.length})
                  </button>
                  <button
                     className={`filter-btn ${filterStatus === 'cash' ? 'active' : ''}`}
                     onClick={() => setFilterStatus('cash')}
                  >
                     Efectivo ({invoices.filter(i => i.paymentMethod === 'CASH').length})
                  </button>
                  <button
                     className={`filter-btn ${filterStatus === 'card' ? 'active' : ''}`}
                     onClick={() => setFilterStatus('card')}
                  >
                     Tarjeta ({invoices.filter(i => i.paymentMethod === 'CARD').length})
                  </button>
                  <button
                     className={`filter-btn ${filterStatus === 'transfer' ? 'active' : ''}`}
                     onClick={() => setFilterStatus('transfer')}
                  >
                     Transferencia ({invoices.filter(i => i.paymentMethod === 'TRANSFER').length})
                  </button>
               </div>
            </div>

            <div className="search-section">
               <div className="search-container">
                  <i className="fas fa-search"></i>
                  <input
                     type="text"
                     placeholder="Buscar por cliente, servicio o ID..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="search-input"
                  />
               </div>
            </div>
         </div>

         {/* Tabla de facturas */}
         <div className="table-container">
            <table className="billing-table">
               <thead>
                  <tr>
                     <th><i className="fas fa-hashtag"></i> Factura ID</th>
                     <th><i className="fas fa-calendar"></i> Fecha</th>
                     <th><i className="fas fa-concierge-bell"></i> Servicio</th>
                     <th><i className="fas fa-user"></i> Cliente</th>
                     <th><i className="fas fa-dollar-sign"></i> Monto</th>
                     <th><i className="fas fa-credit-card"></i> Método de Pago</th>
                     <th><i className="fas fa-tools"></i> Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {getFilteredInvoices().length > 0 ? (
                     getFilteredInvoices().map((invoice) => (
                        <tr key={invoice.id}>
                           <td>
                              <div className="invoice-id">
                                 <i className="fas fa-file-invoice"></i>
                                 #{invoice.id}
                              </div>
                           </td>
                           <td>
                              <div className="invoice-date">
                                 <i className="fas fa-calendar-alt"></i>
                                 {formatDate(invoice.date)}
                              </div>
                           </td>
                           <td>
                              <div className="service-name">
                                 <i className="fas fa-concierge-bell"></i>
                                 {invoice.product}
                              </div>
                           </td>
                           <td>
                              <div className="customer-name">
                                 <i className="fas fa-user-circle"></i>
                                 {invoice.customer}
                              </div>
                           </td>
                           <td>
                              <div className="amount">
                                 <i className="fas fa-dollar-sign"></i>
                                 {formatCurrency(invoice.amount)}
                              </div>
                           </td>
                           <td>
                              <span className={`payment-method-badge ${invoice.paymentMethod.toLowerCase()}`}>
                                 <i className={`fas ${
                                    invoice.paymentMethod === 'CASH' ? 'fa-money-bill-wave' :
                                    invoice.paymentMethod === 'CARD' ? 'fa-credit-card' :
                                    'fa-exchange-alt'
                                 }`}></i>
                                 {invoice.paymentMethod === 'CASH' ? 'Efectivo' :
                                  invoice.paymentMethod === 'CARD' ? 'Tarjeta' :
                                  'Transferencia'}
                              </span>
                           </td>
                           <td className="invoice-actions">
                              <button
                                 className="email-btn"
                                 onClick={() => handleSendEmail(invoice)}
                                 title="Enviar factura por email"
                              >
                                 <i className="fas fa-envelope"></i> Email
                              </button>
                              <button
                                 className="pdf-btn"
                                 onClick={() => handleDownloadPDF(invoice)}
                                 title="Descargar PDF"
                              >
                                 <i className="fas fa-file-pdf"></i> PDF
                              </button>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan="7" className="no-data">
                           <i className="fas fa-info-circle"></i>
                           {invoices.length === 0 ? 'No hay facturas registradas.' : 'No se encontraron facturas con los filtros aplicados.'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Estadísticas */}
         <div className="billing-stats">
            <div className="stat-card">
               <div className="stat-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
               </div>
               <div className="stat-info">
                  <h4>Total Facturas</h4>
                  <p className="stat-number">{invoices.length}</p>
               </div>
            </div>
            <div className="stat-card">
               <div className="stat-icon">
                  <i className="fas fa-dollar-sign"></i>
               </div>
               <div className="stat-info">
                  <h4>Monto Total</h4>
                  <p className="stat-number">{formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</p>
               </div>
            </div>
            <div className="stat-card">
               <div className="stat-icon">
                  <i className="fas fa-calendar-alt"></i>
               </div>
               <div className="stat-info">
                  <h4>Esta Semana</h4>
                  <p className="stat-number">
                     {invoices.filter(inv => {
                        const invoiceDate = new Date(inv.date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return invoiceDate >= weekAgo;
                     }).length}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

export default BillingPage;

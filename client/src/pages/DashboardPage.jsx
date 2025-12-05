import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
   LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { useUser } from '../contexts/UserContext';
import '../styles/dashboard.css';

const DashboardPage = () => {
   const { user } = useUser();
   const [dashboardData, setDashboardData] = useState(null);
   const [filteredData, setFilteredData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [filters, setFilters] = useState({
      period: 'month',
      startDate: '',
      endDate: '',
      product: 'all',
      customer: 'all'
   });

   useEffect(() => {
      fetchDashboardData();
   }, []);

   useEffect(() => {
      if (dashboardData) {
         applyFilters();
      }
   }, [dashboardData, filters]);

   const fetchDashboardData = async () => {
      try {
         const token = Cookies.get('token');
         
         if (!token) {
            return;
         }

         const response = await axios.get('http://localhost:5000/payment/dashboard/sales', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
         });

         setDashboardData(response.data);
      } catch (error) {
      } finally {
         setLoading(false);
      }
   };

   const applyFilters = () => {
      if (!dashboardData) return;

      let filtered = [...dashboardData.sales]; // Usar solo las ventas pagadas para gráficos

      // Filter by date range
      if (filters.startDate && filters.endDate) {
         filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            return itemDate >= startDate && itemDate <= endDate;
         });
      } else {
         // Filter by period
         const now = new Date();
         let startDate;

         switch (filters.period) {
            case 'day':
               startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
               break;
            case 'week':
               startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
               break;
            case 'month':
               startDate = new Date(now.getFullYear(), now.getMonth(), 1);
               break;
            case 'year':
               startDate = new Date(now.getFullYear(), 0, 1);
               break;
            default:
               startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
         }

         filtered = filtered.filter(item => new Date(item.date) >= startDate);
      }

      // Filter by product
      if (filters.product !== 'all') {
         filtered = filtered.filter(item => item.product === filters.product);
      }

      // Filter by customer
      if (filters.customer !== 'all') {
         filtered = filtered.filter(item => item.customer === filters.customer);
      }

      setFilteredData(filtered);
   };

   const handleFilterChange = (field, value) => {
      setFilters(prev => ({
         ...prev,
         [field]: value
      }));
   };

   // Prepare data for charts
   const prepareChartData = () => {
      // Group by date for line chart
      const dateGroups = filteredData.reduce((acc, item) => {
         const date = new Date(item.date).toLocaleDateString();
         if (!acc[date]) acc[date] = 0;
         acc[date] += item.amount;
         return acc;
      }, {});

      const lineData = Object.entries(dateGroups).map(([date, amount]) => ({
         date,
         amount
      }));

      // Group by product for bar chart
      const productGroups = filteredData.reduce((acc, item) => {
         if (!acc[item.product]) acc[item.product] = 0;
         acc[item.product] += item.amount;
         return acc;
      }, {});

      const barData = Object.entries(productGroups).map(([product, amount]) => ({
         product,
         amount
      }));

      // Group by customer for pie chart
      const customerGroups = filteredData.reduce((acc, item) => {
         if (!acc[item.customer]) acc[item.customer] = 0;
         acc[item.customer] += item.amount;
         return acc;
      }, {});

      const pieData = Object.entries(customerGroups).map(([customer, amount]) => ({
         name: customer,
         value: amount
      }));

      return { lineData, barData, pieData };
   };

   const { lineData, barData, pieData } = prepareChartData();

   const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

   if (loading) {
      return (
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loading-spinner">
               <i className="fas fa-spinner fa-spin"></i>
               <p>Cargando dashboard...</p>
            </div>
         </div>
      );
   }

   if (!dashboardData) {
      return (
         <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ffc107', marginBottom: '16px' }}></i>
            <p>No se pudieron cargar los datos del dashboard</p>
         </div>
      );
   }

   return (
      <div className="dashboard-container">
         <div className="dashboard-header">
            <div className="welcome-section">
               <h1>
                  <i className="fas fa-chart-line"></i> Dashboard
               </h1>
               {user && (
                  <p className="welcome-message">
                     ¡Bienvenido de vuelta, <span className="user-name">{user.name} {user.lastname}</span>!
                  </p>
               )}
            </div>
            <p>Resumen general de tu negocio</p>
         </div>

         {/* Summary Cards */}
         <div className="summary-cards">
            <div className="summary-card">
               <div className="card-icon">
                  <i className="fas fa-dollar-sign"></i>
               </div>
               <div className="card-content">
                  <h3>${dashboardData.summary.totalRevenue.toFixed(2)}</h3>
                  <p>Ingresos Totales</p>
               </div>
            </div>

            <div className="summary-card">
               <div className="card-icon">
                  <i className="fas fa-shopping-cart"></i>
               </div>
               <div className="card-content">
                  <h3>{dashboardData.summary.totalOrders}</h3>
                  <p>Órdenes Totales</p>
               </div>
            </div>

            <div className="summary-card">
               <div className="card-icon">
                  <i className="fas fa-chart-bar"></i>
               </div>
               <div className="card-content">
                  <h3>${dashboardData.summary.avgOrderValue.toFixed(2)}</h3>
                  <p>Valor Promedio</p>
               </div>
            </div>

            <div className="summary-card">
               <div className="card-icon">
                  <i className="fas fa-users"></i>
               </div>
               <div className="card-content">
                  <h3>{dashboardData.summary.totalCustomers}</h3>
                  <p>Clientes Atendidos</p>
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="filters-section">
            <div className="filter-group">
               <label>Período:</label>
               <select 
                  value={filters.period} 
                  onChange={(e) => handleFilterChange('period', e.target.value)}
               >
                  <option value="day">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="year">Este año</option>
               </select>
            </div>

            <div className="filter-group">
               <label>Fecha inicio:</label>
               <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
               />
            </div>

            <div className="filter-group">
               <label>Fecha fin:</label>
               <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
               />
            </div>

            <div className="filter-group">
               <label>Producto:</label>
               <select 
                  value={filters.product} 
                  onChange={(e) => handleFilterChange('product', e.target.value)}
               >
                  <option value="all">Todos los productos</option>
                  {/* Opciones dinámicas de productos */}
                  {[...new Set(dashboardData.sales.map(sale => sale.product))].map(product => (
                     <option key={product} value={product}>{product}</option>
                  ))}
               </select>
            </div>

            <div className="filter-group">
               <label>Cliente:</label>
               <select 
                  value={filters.customer} 
                  onChange={(e) => handleFilterChange('customer', e.target.value)}
               >
                  <option value="all">Todos los clientes</option>
                  {/* Opciones dinámicas de clientes */}
                  {[...new Set(dashboardData.sales.map(sale => sale.customer))].map(customer => (
                     <option key={customer} value={customer}>{customer}</option>
                  ))}
               </select>
            </div>
         </div>

         {/* Charts Grid */}
         <div className="charts-grid">
            {/* Ventas por tiempo */}
            <div className="chart-card">
               <h3><i className="fas fa-calendar-alt"></i> Ventas por Tiempo</h3>
               <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={lineData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" />
                     <YAxis />
                     <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                     <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#667eea" 
                        fill="#667eea" 
                        fillOpacity={0.3}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            {/* Ventas por producto */}
            <div className="chart-card">
               <h3><i className="fas fa-box"></i> Ventas por Producto</h3>
               <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="product" />
                     <YAxis />
                     <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                     <Bar dataKey="amount" fill="#764ba2" />
                  </BarChart>
               </ResponsiveContainer>
            </div>

            {/* Distribución por cliente */}
            <div className="chart-card">
               <h3><i className="fas fa-users"></i> Ventas por Cliente</h3>
               <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                  </PieChart>
               </ResponsiveContainer>
            </div>

            {/* Tendencia mensual */}
            <div className="chart-card">
               <h3><i className="fas fa-trending-up"></i> Tendencia de Ventas</h3>
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" />
                     <YAxis />
                     <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                     <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                     />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
   );
};

export default DashboardPage;

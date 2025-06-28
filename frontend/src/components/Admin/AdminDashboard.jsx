import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../context/ApiContext';
import ProductManager from './ProductManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { backendUrl } = useApi();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes] = await Promise.all([
        fetch(`${backendUrl}/products`)
      ]);
      
      if (productsRes.ok) {
        const products = await productsRes.json();
        setStats(prev => ({
          ...prev,
          totalProducts: products.length
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Panel de Administración</h1>
          <div className="admin-user-info">
            <span>Bienvenido, {user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Productos</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Usuarios</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Pedidos</h3>
          <p>{stats.totalOrders}</p>
        </div>
      </div>

      <div className="admin-content">
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Productos
          </button>
          <button 
            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Pedidos
          </button>
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </button>
        </nav>

        <main className="admin-main">
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'orders' && <div>Gestión de Pedidos (Próximamente)</div>}
          {activeTab === 'users' && <div>Gestión de Usuarios (Próximamente)</div>}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 
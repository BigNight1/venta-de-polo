import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import MainLayout from './components/Layout/MainLayout';
import DetalleProducto from './components/Products/DetalleProducto';
import Catalogo from './components/Products/Catalogo';
import './styles/index.css';

function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas del admin */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas públicas del e-commerce */}
              <Route path="/" element={
                <MainLayout>
                  <Catalogo />
                </MainLayout>
              } />
              <Route path="/producto/:id" element={
                <MainLayout>
                  <DetalleProducto />
                </MainLayout>
              } />
            </Routes>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ApiProvider>
  );
}

export default App;

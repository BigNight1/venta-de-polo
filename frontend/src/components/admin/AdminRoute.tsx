import React from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminPanel } from './AdminPanel';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAdminAuth();

  if (!isAuthenticated || !admin || admin.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {/* Admin Header with Logout */}
      <div className="bg-red-600 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Modo Administrador</span>
          </div>
          <button
            onClick={logout}
            className="text-sm hover:text-red-200 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <AdminPanel />
    </div>
  );
};
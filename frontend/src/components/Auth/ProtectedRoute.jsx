import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Muestra un loader mientras se valida el token
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.1rem',
                color: '#666'
            }}>
                Verificando sesión...
            </div>
        );
    }

    if (!user) {
        // Si no hay usuario, redirige al login, guardando la ruta original
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si el usuario está autenticado, renderiza el contenido
    return children;
};

export default ProtectedRoute; 
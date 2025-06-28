import React, { createContext, useState, useContext, useEffect } from 'react';
import { useApi } from './ApiContext';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { backendUrl } = useApi();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Estado de carga
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await fetch(`${backendUrl}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            logout(); // El token no es válido
          }
        } catch (error) {
          console.error("Session validation error:", error);
          logout();
        }
      }
      setLoading(false); // Terminó de cargar
    };

    validateToken();
  }, [token, backendUrl]);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        // El useEffect se encargará de establecer el usuario
        navigate('/admin');
        return true;
      } else {
        // Manejar error de login
        console.error('Login failed');
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // No renderizar hijos hasta que la validación del token termine
  if (loading) {
    return <div>Cargando aplicación...</div>; // O un spinner/componente de carga
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
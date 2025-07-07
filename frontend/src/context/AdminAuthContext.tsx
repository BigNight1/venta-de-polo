import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AdminInfo {
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AdminAuthContextProps {
  admin: AdminInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextProps>({
  admin: null,
  token: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    
    const token = localStorage.getItem('admin_token');
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded && decoded.role) {
          return {
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            firstName: decoded.firstName || 'Admin',
            lastName: decoded.lastName || ''
          };
        }
      } catch (e) { console.log('[AdminAuth] useState init - decode error', e); }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      const stored = localStorage.getItem('admin_info');
      if (stored) {
        setAdmin(JSON.parse(stored));
      } else {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded && decoded.role) {
            setAdmin({
              username: decoded.username,
              email: decoded.email,
              role: decoded.role,
              firstName: decoded.firstName || 'Admin',
              lastName: decoded.lastName || ''
            });
          }
        } catch (e) { console.log('[AdminAuth] useEffect - decode error', e); }
      }
    } else {
      setIsAuthenticated(false);
      setAdmin(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        console.log('[AdminAuth] login - decoded token:', jwtDecode(data.access_token));
      }
      if (data.user) {
        console.log('[AdminAuth] login - user:', data.user);
      }
      if (!res.ok || !data.access_token) {
        return { success: false, error: data.message || 'Credenciales incorrectas' };
      }
      setToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
      if (data.user && data.user.role) {
        const adminInfo: AdminInfo = {
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          firstName: data.user.firstName,
          lastName: data.user.lastName
        };
        setAdmin(adminInfo);
        localStorage.setItem('admin_info', JSON.stringify(adminInfo));
        console.log('[AdminAuth] login - set adminInfo:', adminInfo);
      }
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      console.log('[AdminAuth] login - error:', err);
      return { success: false, error: err.message || 'Error desconocido' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 
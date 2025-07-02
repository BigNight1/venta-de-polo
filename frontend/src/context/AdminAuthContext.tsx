import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminInfo {
  username: string;
}

interface AdminAuthContextProps {
  admin: AdminInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      // Puedes decodificar el token para obtener info del admin si lo deseas
      // Aquí solo guardamos el username si lo recibimos en login
    } else {
      setIsAuthenticated(false);
      setAdmin(null);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) {
        return { success: false, error: data.message || 'Credenciales incorrectas' };
      }
      setToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
      setAdmin({ username: data.username || username });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error desconocido' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 
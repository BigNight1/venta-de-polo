import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ProductProvider } from './context/ProductContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/FirebaseAuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </StrictMode>
);

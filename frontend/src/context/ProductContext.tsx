import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '../types';

interface ProductContextProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const ProductContext = createContext<ProductContextProps>({
  products: [],
  loading: false,
  error: null,
  refresh: () => {},
});

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, refresh: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

// Exportar el contexto para que los hooks puedan acceder a él
export { ProductContext }; 

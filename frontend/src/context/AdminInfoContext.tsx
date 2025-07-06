import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '../types';
import type { 
  AdminInfoContextType, 
  AdminAnalytics, 
  CategoryCount,
} from '../types/typeInfo';
import { useAdminAuth } from './AdminAuthContext';

const AdminInfoContext = createContext<AdminInfoContextType | undefined>(undefined);

export const useAdminInfo = () => {
  const context = useContext(AdminInfoContext);
  if (!context) {
    throw new Error('useAdminInfo must be used within an AdminInfoProvider');
  }
  return context;
};

interface AdminInfoProviderProps {
  children: ReactNode;
}

export const AdminInfoProvider: React.FC<AdminInfoProviderProps> = ({ children }) => {
  const { token } = useAdminAuth();
  
  // Estado de productos
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del formulario
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    images: [],
    category: 'hombre',
    variants: [],
    inStock: true,
    featured: false,
  });

  // Fetch products from backend
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      
      // Filtrar productos duplicados y asegurar IDs únicos
      const uniqueProducts = data.filter((product: Product, index: number, self: Product[]) => 
        index === self.findIndex(p => p._id === product._id)
      );
      
      setProducts(uniqueProducts);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear producto
  const createProduct = async (productData: Partial<Product>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) {
        // Si la respuesta tiene un array de errores (NestJS ValidationPipe)
        if (Array.isArray(data.message)) {
          throw new Error(data.message.join(' | '));
        }
        // Si la respuesta tiene un campo 'errors' (class-validator)
        if (Array.isArray(data.errors)) {
          throw new Error(data.errors.map((e: any) => e.message || e).join(' | '));
        }
        throw new Error((data as any).message || 'Error al crear producto');
      }
      setProducts(prev => [...prev, data]);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar producto
  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as any).message || 'Error al actualizar producto');
      setProducts(prev => prev.map(p => p._id === productId ? data : p));
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Error al eliminar producto');
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones del formulario
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      images: [],
      category: 'hombre',
      variants: [],
      inStock: true,
      featured: false,
    });
    setIsEditing(false);
    setIsCreating(false);
    setEditingProduct(null);
  };

  const updateFormData = (data: Partial<Product>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Analytics
  const analytics: AdminAnalytics = {
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.inStock).length,
    featuredProducts: products.filter(p => p.featured).length,
    outOfStockProducts: products.filter(p => !p.inStock).length,
    averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
    categoriesCount: {
      hombre: products.filter(p => p.category === 'hombre').length,
      mujer: products.filter(p => p.category === 'mujer').length,
      ninos: products.filter(p => p.category === 'ninos').length,
    }
  };

  // Fetch products when token changes
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const value: AdminInfoContextType = {
    // Estado
    products,
    isLoading,
    error,
    editingProduct,
    isEditing,
    isCreating,
    formData,
    analytics,
    
    // Funciones
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    handleEdit,
    handleCreate,
    resetForm,
    updateFormData,
  };

  return (
    <AdminInfoContext.Provider value={value}>
      {children}
    </AdminInfoContext.Provider>
  );
}; 
import type { Product } from './index';

// Interfaces para el AdminInfoContext
export interface AdminInfoContextType {
  // Estado de productos
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Estado del formulario
  editingProduct: Product | null;
  isEditing: boolean;
  isCreating: boolean;
  formData: Partial<Product>;
  
  // Analytics
  analytics: AdminAnalytics;
  
  // Funciones de productos
  fetchProducts: () => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Funciones del formulario
  handleEdit: (product: Product) => void;
  handleCreate: () => void;
  resetForm: () => void;
  updateFormData: (data: Partial<Product>) => void;
}

// Interface para analytics del admin
export interface AdminAnalytics {
  totalProducts: number;
  inStockProducts: number;
  featuredProducts: number;
  outOfStockProducts: number;
  averagePrice: number;
  categoriesCount: CategoryCount;
}

// Interface para conteo de categorías
export interface CategoryCount {
  hombre: number;
  mujer: number;
  ninos: number;
}

// Interface para formulario de producto
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'hombre' | 'mujer' | 'ninos';
  variants: { size: string; color: string; stock: number }[];
  inStock: boolean;
  featured: boolean;
  createdAt?: string;
}

// Interface para respuestas de API del admin
export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interface para filtros del admin
export interface AdminFilters {
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Interface para estadísticas del admin
export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingProducts: Product[];
  recentOrders: any[]; // Puedes definir una interface específica para órdenes
}

// Interface para configuración del admin
export interface AdminConfig {
  allowProductCreation: boolean;
  allowProductDeletion: boolean;
  requireApproval: boolean;
  maxImagesPerProduct: number;
  maxStockPerVariant: number;
}

// Interface para logs de actividad del admin
export interface AdminActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entity: 'product' | 'order' | 'user' | 'system';
  entityId?: string;
  description: string;
  timestamp: string;
  adminId: string;
  adminName: string;
} 
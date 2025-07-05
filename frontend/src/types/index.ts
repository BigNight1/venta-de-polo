export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  category: 'hombre' | 'mujer' | 'ninos';
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  size: string;
  color: string;
  search: string;
}

// Re-exportar interfaces del archivo typeInfo.ts
export type {
  AdminInfoContextType,
  AdminAnalytics,
  CategoryCount,
  ProductFormData,
  AdminApiResponse,
  AdminFilters,
  AdminStats,
  AdminConfig,
  AdminActivityLog
} from './typeInfo';
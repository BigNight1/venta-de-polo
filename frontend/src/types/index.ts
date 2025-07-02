export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'hombre' | 'mujer' | 'ninos';
  sizes: Size[];
  colors: Color[];
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export interface Size {
  id: string;
  name: string;
  stock: number;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  sizeId: string;
  colorId: string;
  quantity: number;
  unitPrice: number;
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
  sizeId: string;
  colorId: string;
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
  sizes: string[];
  colors: string[];
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
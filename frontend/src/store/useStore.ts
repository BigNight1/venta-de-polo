import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, User, FilterState } from '../types';

interface StoreState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart state
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;

  // Products state
  products: Product[];
  setProducts: (products: Product[]) => void;
  
  // Filters state
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // UI state
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  showCheckout: boolean;
  setShowCheckout: (show: boolean) => void;
}

const initialFilters: FilterState = {
  category: '',
  priceRange: [0, 500],
  size: '',
  color: '',
  search: '',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Cart state
      cartItems: [],
      addToCart: (product, size, color, quantity) => {
        const cartItems = get().cartItems;
        const existingItemIndex = cartItems.findIndex(
          item => 
            item.product._id === product._id && 
            item.size === size && 
            item.color === color
        );
        const variant = product.variants.find(v => v.size.toUpperCase() === size.toUpperCase() && v.color.toUpperCase() === color.toUpperCase());
        const maxStock = variant?.stock || 1;
        if (existingItemIndex >= 0) {
          const updatedItems = [...cartItems];
          const newQty = Math.min(updatedItems[existingItemIndex].quantity + quantity, maxStock);
          updatedItems[existingItemIndex].quantity = newQty;
          set({ cartItems: updatedItems });
        } else {
          const newItem: CartItem = {
            product,
            size,
            color,
            quantity: Math.min(quantity, maxStock),
          };
          set({ cartItems: [...cartItems, newItem] });
        }
      },

      removeFromCart: (productId, size, color) => {
        const cartItems = get().cartItems.filter(item => 
          !(item.product._id === productId && item.size === size && item.color === color)
        );
        set({ cartItems });
      },

      updateQuantity: (productId, size, color, quantity) => {
        const cartItems = get().cartItems;
        const product = cartItems.find(item => item.product._id === productId)?.product;
        const variant = product?.variants.find(v => v.size.toUpperCase() === size.toUpperCase() && v.color.toUpperCase() === color.toUpperCase());
        const maxStock = variant?.stock || 1;
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color);
          return;
        }
        const newQty = Math.min(quantity, maxStock);
        const updatedCart = cartItems.map(item =>
          (item.product._id === productId && item.size === size && item.color === color)
            ? { ...item, quantity: newQty }
            : item
        );
        set({ cartItems: updatedCart });
      },

      clearCart: () => {
        set({ cartItems: [] });
        try {
          localStorage.setItem('polo-store', JSON.stringify({ cartItems: [], user: get().user }));
        } catch (e) {}
      },

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },

      getCartItemsCount: () => {
        return get().cartItems.reduce((count, item) => count + item.quantity, 0);
      },

      // Products state
      products: [],
      setProducts: (products) => set({ products }),

      // Filters state
      filters: initialFilters,
      setFilters: (newFilters) => set(state => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      resetFilters: () => set({ filters: initialFilters }),

      // UI state
      isCartOpen: false,
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      isAuthModalOpen: false,
      setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
      selectedProduct: null,
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      showCheckout: false,
      setShowCheckout: (show) => set({ showCheckout: show }),
    }),
    {
      name: 'polo-store',
      partialize: (state) => ({ 
        cartItems: state.cartItems,
        user: state.user,
      }),
    }
  )
);
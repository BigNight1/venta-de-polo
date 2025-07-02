import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, User, FilterState } from '../types';

interface StoreState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart state
  cartItems: CartItem[];
  addToCart: (product: Product, sizeId: string, colorId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
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
  sizes: [],
  colors: [],
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
      addToCart: (product, sizeId, colorId, quantity) => {
        const cartItems = get().cartItems;
        const existingItemIndex = cartItems.findIndex(
          item => 
            item.productId === product.id && 
            item.sizeId === sizeId && 
            item.colorId === colorId
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ cartItems: updatedItems });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${sizeId}-${colorId}-${Date.now()}`,
            productId: product.id,
            product,
            sizeId,
            colorId,
            quantity,
            unitPrice: product.price,
          };
          set({ cartItems: [...cartItems, newItem] });
        }
      },

      removeFromCart: (itemId) => {
        const cartItems = get().cartItems.filter(item => item.id !== itemId);
        set({ cartItems });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        
        const cartItems = get().cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ cartItems });
      },

      clearCart: () => set({ cartItems: [] }),

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
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
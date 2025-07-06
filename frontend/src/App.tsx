import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProductGrid } from './components/product/ProductGrid';
import { ProductModal } from './components/product/ProductModal';
import { CartPanel } from './components/cart/CartPanel';
import { AuthModal } from './components/auth/AuthModal';
import { MyOrders } from './components/pages/MyOrders';
import { About } from './components/pages/About';
import { Contact } from './components/pages/Contact';
import { AdminRoute } from './components/admin/AdminRoute';
import { useStore } from './store/useStore';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { AdminInfoProvider } from './context/AdminInfoContext';
import { OrderConfirmation } from './components/checkout/OrderConfirmation';

function AppContent() {
  const { selectedProduct } = useStore();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout');

  return (
    <div className="min-h-screen  bg-gray-50 flex flex-col">
      {/* Header solo si no es admin */}
      {!isAdminRoute && <Header />}

      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<ProductGrid />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/MisPedidos" element={<MyOrders />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderConfirmation />} />
          <Route path="/admin/*" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer solo si no es admin */}
      {!isAdminRoute && <Footer />}

      {/* Modals */}
      {selectedProduct && <ProductModal />}
      <CartPanel />
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminInfoProvider>
        <AppContent />
      </AdminInfoProvider>
    </BrowserRouter>
  );
}

export default App;
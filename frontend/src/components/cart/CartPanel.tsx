import React from 'react';
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export const CartPanel: React.FC = () => {
  const { 
    isCartOpen, 
    setCartOpen, 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal,
    getCartItemsCount,
  } = useStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setCartOpen(false)}
        />

        {/* Panel */}
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrito ({getCartItemsCount()})
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Agrega algunos productos para comenzar
                  </p>
                  <Button
                    onClick={() => setCartOpen(false)}
                    variant="outline"
                  >
                    Continuar comprando
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const variant = item.product.variants.find(v => v.size.toUpperCase() === item.size.toUpperCase() && v.color.toUpperCase() === item.color.toUpperCase());
                    return (
                      <div key={item.product._id + '-' + item.size + '-' + item.color} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={(item.product.images?.[0]?.url || '')}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>Talla: {item.size}</span>
                            <span className="mx-2">•</span>
                            <span>Color: {item.color}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(item.product.price)}
                            </span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                min={1}
                                max={variant?.stock || 1}
                                onChange={e => {
                                  const val = Math.max(1, Math.min(Number(e.target.value), variant?.stock || 1));
                                  updateQuantity(item.product._id, item.size, item.color, val);
                                }}
                                className="w-10 text-center border rounded"
                                disabled={!variant || variant.stock === 0}
                              />
                              <button
                                onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)}
                                disabled={item.quantity >= (variant?.stock || 1)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-base font-medium text-gray-900">
                  <span>Subtotal</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Envío</span>
                  <span>{getCartTotal() > 50 ? 'Gratis' : formatPrice(10)}</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(getCartTotal() + (getCartTotal() > 50 ? 0 : 10))}</span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    Proceder al pago
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCartOpen(false)}
                    className="w-full"
                  >
                    Continuar comprando
                  </Button>
                </div>

                {/* Security Notice */}
                <p className="text-xs text-gray-500 text-center">
                  🔒 Pago seguro con cifrado SSL
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
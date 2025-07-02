import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { getImageUrl } from '../../lib/getImageUrl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart } = useStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add with default first size and color
    if (product.sizes.length > 0 && product.colors.length > 0) {
      addToCart(product, product.sizes[0].id, product.colors[0].id, 1);
    }
  };

  const handleProductClick = () => {
    setSelectedProduct(product);
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden will-change-transform">
      {/* Image Container - Optimizado para mejor rendimiento */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={getImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform duration-200 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay Actions - Optimizado sin retraso */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <Button
              size="sm"
              onClick={handleQuickAdd}
              className="shadow-lg backdrop-blur-sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Badges */}
        {product.featured && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-md shadow-sm">
            Destacado
          </div>
        )}
        
        {!product.inStock && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-md shadow-sm">
            Agotado
          </div>
        )}

        {/* Wishlist Button - Optimizado */}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-50 transform translate-y-1 group-hover:translate-y-0">
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 
          className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-150"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Colors */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-gray-500 mr-2">Colores:</span>
          {product.colors.slice(0, 4).map((color) => (
            <div
              key={color.id}
              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
          )}
        </div>

        {/* Sizes */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-gray-500 mr-2">Tallas:</span>
          <div className="flex flex-wrap gap-1">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size.id}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {size.name}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
            )}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button
            size="sm"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="min-w-[100px]"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.inStock ? 'Agregar' : 'Agotado'}
          </Button>
        </div>
      </div>
    </div>
  );
};
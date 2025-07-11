import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { COLOR_MAP } from '../../lib/colors';
import { StarRating } from '../../lib/StarRating';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart } = useStore();

  // Extraer tallas y colores únicos de las variantes
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color.toUpperCase())));

  // Al hacer clic en agregar al carrito, usar la primera variante disponible
  const handleAddToCart = () => {
    const firstVariant = product.variants.find(v => v.stock > 0);
    if (firstVariant) {
      addToCart(product, firstVariant.size, firstVariant.color, 1);
    }
  };

  const handleProductClick = () => {
    setSelectedProduct(product);
  };

  // Determinar si el producto está agotado (todas las variantes stock 0)
  const isOutOfStock = !product.variants.some(v => v.stock > 0);

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden will-change-transform">
      {/* Image Container - Optimizado para mejor rendimiento */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={(product.images?.[0]?.url || '')}
          alt={product.name}
          className="w-full h-full object-contain transform transition-transform duration-200 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay Actions - Optimizado sin retraso */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <Button
              size="sm"
              onClick={handleAddToCart}
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
        
        {isOutOfStock && (
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
        
        {/* Stars and reviews */}
        <div className="flex items-center space-x-2 mb-2">
          <StarRating rating={typeof product.averageRating === 'number' ? product.averageRating : 0} />
          <span className="text-sm text-gray-500">
            ({typeof product.reviewCount === 'number' ? product.reviewCount : 0} reseñas)
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Colors */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-gray-500 mr-2">Colores:</span>
          {uniqueColors.slice(0, 4).map((color) => (
            COLOR_MAP[color] ? (
            <div
                key={color}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: COLOR_MAP[color] }}
                title={color}
              />
            ) : /^#([0-9A-F]{3}){1,2}$/i.test(color) ? (
              <div
                key={color}
              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
            />
            ) : (
              <span key={color} className="text-xs text-gray-700 font-semibold border px-1 rounded bg-gray-100">{color}</span>
            )
          ))}
          {uniqueColors.length > 4 && (
            <span className="text-xs text-gray-500">+{uniqueColors.length - 4}</span>
          )}
        </div>

        {/* Sizes */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-gray-500 mr-2">Tallas:</span>
          <div className="flex flex-wrap gap-1">
            {uniqueSizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {size}
              </span>
            ))}
            {uniqueSizes.length > 4 && (
              <span className="text-xs text-gray-500">+{uniqueSizes.length - 4}</span>
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
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="min-w-[100px]"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isOutOfStock ? 'Agotado' : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
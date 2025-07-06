import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Sidebar } from '../layout/Sidebar';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { useProducts } from '../../context/ProductContext';

export const ProductGrid: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { filters } = useStore();
  const { products, loading, error } = useProducts();
  const [sortOption, setSortOption] = useState('name'); // 'name', 'price-low', 'price-high', 'newest'

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Size filter
      if (filters.size) {
        const hasSize = product.variants.some(variant => variant.size === filters.size);
        if (!hasSize) return false;
      }

      // Color filter
      if (filters.color) {
        const selectedColor = filters.color.trim().toLowerCase();
        const hasColor = product.variants.some(variant =>
          (variant.color || '').trim().toLowerCase() === selectedColor
        );
        if (!hasColor) return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }, [filters, products]);

  // Ordenar productos según sortOption
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sortOption === 'price-low') {
      arr.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      arr.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'name') {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [filteredProducts, sortOption]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hombre: 'Hombre',
      mujer: 'Mujer',
      ninos: 'Niños',
    };
    return labels[category] || 'Todos los productos';
  };

  if (loading) return <div className="p-6">Cargando productos...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Filter Button */}
        <div className="lg:hidden p-4 border-b border-gray-200">
          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(true)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {filters.category ? getCategoryLabel(filters.category) : 'Todos los productos'}
            </h1>
            
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>

              {/* Sort Options */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
              >
                <option value="name">Ordenar por nombre</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>

            {/* Active Filters */}
            {(filters.category || filters.size || filters.color || filters.search) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {getCategoryLabel(filters.category)}
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    "{filters.search}"
                  </span>
                )}
                {filters.size && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Talla {filters.size}
                  </span>
                )}
                {filters.color && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                    {filters.color}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8h-2M9 13h1m5 0h1"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Intenta ajustar los filtros para encontrar lo que buscas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
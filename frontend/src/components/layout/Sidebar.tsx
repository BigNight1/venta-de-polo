import React from 'react';
import { X, Filter } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, resetFilters } = useStore();

  const categories = [
    { id: '', label: 'Todos' },
    { id: 'hombre', label: 'Hombre' },
    { id: 'mujer', label: 'Mujer' },
    { id: 'ninos', label: 'Niños' },
  ];

  const sizes = [
    { id: 'XS', label: 'XS' },
    { id: 'S', label: 'S' },
    { id: 'M', label: 'M' },
    { id: 'L', label: 'L' },
    { id: 'XL', label: 'XL' },
  ];

  const colors = [
    { id: 'Blanco', label: 'Blanco', hex: '#FFFFFF' },
    { id: 'Negro', label: 'Negro', hex: '#000000' },
    { id: 'Rojo', label: 'Rojo', hex: '#DC2626' },
    { id: 'Azul', label: 'Azul', hex: '#2563EB' },
    { id: 'Verde', label: 'Verde', hex: '#16A34A' },
    { id: 'Rosa', label: 'Rosa', hex: '#EC4899' },
    { id: 'Amarillo', label: 'Amarillo', hex: '#EAB308' },
    { id: 'Morado', label: 'Morado', hex: '#9333EA' },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setFilters({ category: categoryId });
  };

  const handleSizeChange = (sizeId: string) => {
    setFilters({ size: filters.size === sizeId ? '' : sizeId });
  };

  const handleColorChange = (colorId: string) => {
    setFilters({ color: filters.color === colorId ? '' : colorId });
  };

  const handlePriceChange = (min: number, max: number) => {
    setFilters({ priceRange: [min, max] });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:transform-none lg:shadow-none lg:w-64 lg:border-r lg:border-gray-200 z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Limpiar
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Categoría</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Precio (S/)</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Talla</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeChange(size.id)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-200
                    ${filters.size === size.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }
                  `}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.id)}
                  className={`
                    relative w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${filters.color === color.id
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                >
                  {filters.color === color.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
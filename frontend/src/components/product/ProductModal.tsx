import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ShoppingCart, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';

const COLOR_MAP: Record<string, string> = {
  'BLANCO': '#FFFFFF',
  'NEGRO': '#000000',
  'ROJO': '#DC2626',
  'AZUL': '#2563EB',
  'VERDE': '#16A34A',
  'ROSA': '#EC4899',
  'AMARILLO': '#EAB308',
  'MORADO': '#9333EA',
};

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setShowCheckout } = useStore();
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomActive, setIsZoomActive] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!selectedProduct) return null;

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  // Prevenir scroll SOLO cuando el zoom está activo
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      // Solo prevenir scroll si el zoom está activo Y el mouse está sobre la imagen
      if (isZoomActive && imageRef.current && imageRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (isZoomActive) {
      document.addEventListener('wheel', preventScroll, { passive: false });
    }
    
    return () => {
      document.removeEventListener('wheel', preventScroll);
    };
  }, [isZoomActive]);

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedSizeId('');
    setSelectedColorId('');
    setQuantity(1);
    setZoomLevel(1);
    setIsZoomActive(false);
    setSelectedImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!selectedSizeId || !selectedColorId) {
      alert('Por favor selecciona una talla y un color');
      return;
    }
    
    addToCart(selectedProduct, selectedSizeId, selectedColorId, quantity);
    handleClose();
  };

  const handleBuyNow = () => {
    if (!selectedSizeId || !selectedColorId) {
      alert('Por favor selecciona una talla y un color');
      return;
    }
    addToCart(selectedProduct, selectedSizeId, selectedColorId, quantity);
    handleClose();
    setShowCheckout(true);
  };

  // Activar zoom solo con click en la lupa
  const activateZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomActive(true);
    setZoomLevel(1);
  };

  // Desactivar zoom
  const deactivateZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomActive(false);
    setZoomLevel(1);
    setZoomPosition({ x: 50, y: 50 });
  };

  // Mouse move solo cuando zoom está activo
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomActive) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setZoomPosition({ x: clampedX, y: clampedY });
  }, [isZoomActive]);

  // Wheel zoom SOLO cuando zoom está activo
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!isZoomActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });

    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    const newZoomLevel = Math.max(1, Math.min(5, zoomLevel + delta));
    
    setZoomLevel(newZoomLevel);
    
    // Si el zoom llega a 1, desactivar zoom
    if (newZoomLevel <= 1) {
      setIsZoomActive(false);
    }
  }, [zoomLevel, isZoomActive]);

  // Normalizar tallas y colores a mayúsculas
  const uniqueSizes = Array.from(new Set(selectedProduct.variants.map(v => v.size.toUpperCase())));
  const uniqueColors = Array.from(new Set(selectedProduct.variants.map(v => v.color.toUpperCase())));

  // Filtrar tallas disponibles para el color seleccionado
  const availableSizes = selectedColorId
    ? selectedProduct.variants.filter(v => v.color.toUpperCase() === selectedColorId && v.stock > 0).map(v => v.size.toUpperCase())
    : uniqueSizes;

  // Filtrar colores disponibles para la talla seleccionada
  const availableColors = selectedSizeId
    ? selectedProduct.variants.filter(v => v.size.toUpperCase() === selectedSizeId && v.stock > 0).map(v => v.color.toUpperCase())
    : uniqueColors;

  // Cuando el usuario selecciona talla y color, busca la variante
  const selectedVariant = selectedProduct.variants.find(
    v => v.size.toUpperCase() === selectedSizeId && v.color.toUpperCase() === selectedColorId
  );

  // Autoseleccionar si solo hay una variante
  useEffect(() => {
    if (selectedProduct.variants.length === 1) {
      setSelectedSizeId(selectedProduct.variants[0].size.toUpperCase());
      setSelectedColorId(selectedProduct.variants[0].color.toUpperCase());
    }
  }, [selectedProduct]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" ref={modalRef}>
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto h-screen sm:h-auto">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[95vh]">
            {/* Image Gallery */}
            <div className="relative bg-gray-50">
              <div className="aspect-square relative overflow-hidden">
                {/* Main Image */}
                <div
                  ref={imageRef}
                  className={`w-full h-full relative select-none ${
                    isZoomActive ? 'cursor-move' : 'cursor-default'
                  }`}
                  onMouseMove={handleMouseMove}
                  onWheel={handleWheel}
                >
                  <img
                    src={(selectedProduct.images?.[selectedImageIndex]?.url || '')}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                    draggable={false}
                  />
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {!isZoomActive ? (
                      <button
                        onClick={activateZoom}
                        className="bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                        title="Activar zoom"
                      >
                        <ZoomIn className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={deactivateZoom}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                        title="Desactivar zoom"
                      >
                        <ZoomOut className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Zoom Level Indicator */}
                  {isZoomActive && zoomLevel > 1 && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {zoomLevel.toFixed(1)}x
                    </div>
                  )}

                  {/* Zoom Instructions */}
                  {isZoomActive && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs">🖱️ Mueve el mouse para navegar</span>
                        <span className="text-xs">🎯 Rueda para zoom in/out</span>
                        <span className="text-xs">🔍 Click en 🔍 para desactivar</span>
                      </div>
                    </div>
                  )}

                  {/* Miniatures */}
                  {selectedProduct.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white/80 rounded-lg px-2 py-1 shadow">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-14 h-14 rounded border-2 overflow-hidden transition-all ${selectedImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-300 scale-105' : 'border-gray-200 hover:border-blue-300'}`}
                          style={{ outline: 'none' }}
                        >
                          <img
                            src={(img?.url || '')}
                            alt={`Miniatura ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6 lg:p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    Talla {selectedSizeId ? `(${selectedVariant?.stock ?? ''} disponibles)` : '(Seleccionar talla)'}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    {uniqueSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        className={`px-4 py-2 rounded-lg border text-base font-medium transition-colors ${
                          selectedSizeId === size ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-200'
                        } ${!availableSizes.includes(size) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => availableSizes.includes(size) && setSelectedSizeId(selectedSizeId === size ? '' : size)}
                        disabled={!availableSizes.includes(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    Color {selectedColorId ? `- ${selectedVariant?.color ?? ''} (${selectedVariant?.stock ?? ''} disponibles)` : '(Seleccionar color)'}
                  </h3>
                  <div className="flex gap-3 mb-4">
                    {uniqueColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedColorId === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200'
                        } ${!availableColors.includes(color) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: COLOR_MAP[color] || (COLOR_MAP[color] === undefined && /^#([0-9A-F]{3}){1,2}$/i.test(color) ? color : undefined) }}
                        onClick={() => availableColors.includes(color) && setSelectedColorId(selectedColorId === color ? '' : color)}
                        disabled={!availableColors.includes(color)}
                        title={COLOR_MAP[color] ? color : undefined}
                      >
                        {!COLOR_MAP[color] && !/^#([0-9A-F]{3}){1,2}$/i.test(color) && (
                          <span className="text-xs font-semibold text-gray-700">{color}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1 rounded border"
                  >-</button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    max={selectedVariant?.stock || 1}
                    onChange={e => {
                      const val = Math.max(1, Math.min(Number(e.target.value), selectedVariant?.stock || 1));
                      setQuantity(val);
                    }}
                    className="w-12 text-center border rounded"
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                  />
                    <button
                    onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 1, q + 1))}
                    disabled={quantity >= (selectedVariant?.stock || 1)}
                    className="px-3 py-1 rounded border"
                  >+</button>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock === 0 || quantity > (selectedVariant?.stock || 1)}
                    className="w-full"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Agregar al carrito
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant.stock === 0 || !selectedSizeId || !selectedColorId}
                    className="flex-1"
                  >
                    Comprar ahora
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="text-sm text-gray-600">
                  {selectedVariant && selectedVariant.stock > 0 ? (
                    <span className="text-green-600">✓ En stock</span>
                  ) : (
                    <span className="text-red-600">✗ Agotado</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
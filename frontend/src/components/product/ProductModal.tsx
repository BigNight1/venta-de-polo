import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { getImageUrl } from '../../lib/getImageUrl';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setShowCheckout } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomActive, setIsZoomActive] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
    setSelectedImageIndex(0);
    setSelectedSizeId('');
    setSelectedColorId('');
    setQuantity(1);
    setZoomLevel(1);
    setIsZoomActive(false);
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

  const handleImageChange = useCallback((newIndex: number) => {
    setSelectedImageIndex(newIndex);
    setZoomLevel(1);
    setIsZoomActive(false);
    setZoomPosition({ x: 50, y: 50 });
  }, []);

  const selectedSize = selectedProduct.sizes.find(size => size.id === selectedSizeId);
  const selectedColor = selectedProduct.colors.find(color => color.id === selectedColorId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" ref={modalRef}>
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
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
                    src={getImageUrl(selectedProduct.images[selectedImageIndex])}
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
                </div>
                
                {/* Image Navigation */}
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageChange(selectedImageIndex === 0 ? selectedProduct.images.length - 1 : selectedImageIndex - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleImageChange(selectedImageIndex === selectedProduct.images.length - 1 ? 0 : selectedImageIndex + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {selectedProduct.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {selectedProduct.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageChange(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {selectedProduct.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {selectedProduct.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Talla {selectedSize && `(${selectedSize.stock} disponibles)`}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSizeId(size.id)}
                        disabled={size.stock === 0}
                        className={`
                          px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                          ${selectedSizeId === size.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : size.stock === 0
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }
                        `}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Color {selectedColor && `- ${selectedColor.name} (${selectedColor.stock} disponibles)`}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColorId(color.id)}
                        disabled={color.stock === 0}
                        className={`
                          relative w-10 h-10 rounded-full border-2 transition-all
                          ${selectedColorId === color.id
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : color.stock === 0
                            ? 'border-gray-200 opacity-50 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.stock} disponibles)`}
                      >
                        {selectedColorId === color.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                        {color.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Cantidad</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 bg-gray-50 rounded-lg min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedProduct.inStock || !selectedSizeId || !selectedColorId}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Agregar al carrito
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleBuyNow}
                    disabled={!selectedProduct.inStock || !selectedSizeId || !selectedColorId}
                    className="flex-1"
                  >
                    Comprar ahora
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="text-sm text-gray-600">
                  {selectedProduct.inStock ? (
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
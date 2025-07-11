import React, { useState, useRef, useEffect } from 'react';
import { X, ShoppingCart} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { COLOR_MAP } from '../../lib/colors';
import { useNavigate } from 'react-router-dom';
import { Reviews } from './Reviews';
import { StarRating } from '../../lib/StarRating';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useStore();
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  // Reseñas y resumen
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  useEffect(() => {
    if (!selectedProduct) return;
    setLoadingReviews(true);
    fetch(`${import.meta.env.VITE_API_URL}/reviews?productId=${selectedProduct._id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoadingReviews(false);
      })
      .catch(() => setLoadingReviews(false));
  }, [selectedProduct]);
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

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
    navigate('/checkout');
  };


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

          {/* Grid de 2 columnas solo para la parte superior */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="relative bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
              <img
                src={selectedProduct.images?.[selectedImageIndex]?.url || ''}
                alt={selectedProduct.name}
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[250px] sm:max-h-[350px] md:max-h-[400px] lg:max-h-[500px] object-contain rounded"
                style={{ margin: '0 auto' }}
                draggable={false}
              />
              {/* Miniaturas siempre debajo de la imagen, scroll horizontal solo en mobile/tablet, fila en desktop */}
              {selectedProduct.images.length > 1 && (
                <div className="mt-3 w-full flex flex-row flex-wrap justify-center gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 rounded border-2 overflow-hidden transition-all ${selectedImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-300 scale-105' : 'border-gray-200 hover:border-blue-300'}`}
                      style={{ outline: 'none', flex: '0 0 auto' }}
                    >
                      <img
                        src={(img?.url || '')}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Product Info */}
            <div className="p-6 lg:p-8 flex flex-col h-full">
              {/* Header: nombre, estrellas, precio */}
              <div className=" lg:-mx-8 lg:px-8 pt-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {selectedProduct.name}
                </h1>
                <div className="flex items-center space-x-2 mb-2">
                  <StarRating rating={averageRating} />
                  <span className="text-sm text-gray-500">({reviews.length} reseñas)</span>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-600 leading-relaxed py-2">
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
              <div className="text-sm text-gray-600 py-2">
                {selectedSizeId && selectedColorId ? (
                  selectedVariant && selectedVariant.stock > 0 ? (
                    <span className="text-green-600">✓ En stock</span>
                  ) : (
                    <span className="text-red-600">✗ Agotado</span>
                  )
                ) : null}
              </div>
            </div>
          </div>

          {/* Tabs y contenido: una sola columna, todo el ancho */}
          <div className="px-6 pb-8">
            <div className="border-b mb-6 mt-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reseñas ({reviews.length})
                </button>
              </nav>
            </div>
            <div className="w-full">
              {activeTab === 'details' && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm border space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed text-base">{selectedProduct.description}</p>
                  <h4 className="text-lg font-semibold mt-6 mb-2">Características</h4>
                  <ul className="space-y-1 text-gray-700 text-base">
                    {selectedProduct.material && (
                      <li><b>Material:</b> {selectedProduct.material}</li>
                    )}
                    {selectedProduct.cuidado && (
                      <li><b>Cuidado:</b> {selectedProduct.cuidado}</li>
                    )}
                    {selectedProduct.origen && (
                      <li><b>Origen:</b> {selectedProduct.origen}</li>
                    )}
                    {selectedProduct.estilo && (
                      <li><b>Estilo:</b> {selectedProduct.estilo}</li>
                    )}
                    <li><b>Tallas disponibles:</b> {Array.from(new Set(selectedProduct.variants.map(v => v.size.toUpperCase()))).join(', ')}</li>
                    <li><b>Colores disponibles:</b> {Array.from(new Set(selectedProduct.variants.map(v => v.color.charAt(0).toUpperCase() + v.color.slice(1).toLowerCase()))).join(', ')}</li>
                  </ul>
                </div>
              )}
              {activeTab === 'reviews' && (
                <Reviews productId={selectedProduct._id} initialReviews={reviews} loading={loadingReviews} showSummary />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
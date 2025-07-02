import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, Package, TrendingUp, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useAdminInfo } from '../../context/AdminInfoContext';
import { getImageUrl } from '../../lib/getImageUrl';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'analytics'>('overview');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const {
    products,
    isLoading,
    error,
    editingProduct,
    isEditing,
    isCreating,
    formData,
    analytics,
    handleEdit,
    handleCreate,
    resetForm,
    updateFormData,
    createProduct,
    updateProduct,
    deleteProduct,
    addSize,
    updateSize,
    removeSize,
    addColor,
    updateColor,
    removeColor,
    addImage,
    removeImage,
  } = useAdminInfo();

  const handleSave = async () => {
    if (!formData.name || !formData.description || formData.price === undefined) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    try {
      if (editingProduct && editingProduct.id) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
        alert('Producto creado correctamente');
      }
      resetForm();
    } catch (err) {
      // Error ya manejado en el contexto
    }
  };

  const handleDelete = async (productId: string) => {
    if (!productId) {
      alert('ID de producto no válido');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      await deleteProduct(productId);
      alert('Producto eliminado correctamente');
    } catch (err) {
      // Error ya manejado en el contexto
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    updateFormData({
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const formDataFile = new FormData();
      formDataFile.append('file', files[i]);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
          },
          body: formDataFile
        });
        const data = await res.json();
        if (data.filePath) {
          updateFormData({ images: [...(formData.images || []), data.filePath] });
        }
      } catch (err) {
        alert('Error al subir la imagen');
      }
    }
    e.target.value = '';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Stock</p>
              <p className="text-3xl font-bold text-green-600">{analytics.inStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agotados</p>
              <p className="text-3xl font-bold text-red-600">{analytics.outOfStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-3xl font-bold text-purple-600">{formatPrice(analytics.averagePrice)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
        <div className="grid grid-cols-3 gap-4">
          <div key="cat-hombre" className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{analytics.categoriesCount.hombre}</p>
            <p className="text-sm text-gray-600">Hombre</p>
          </div>
          <div key="cat-mujer" className="text-center p-4 bg-pink-50 rounded-lg">
            <p className="text-2xl font-bold text-pink-600">{analytics.categoriesCount.mujer}</p>
            <p className="text-sm text-gray-600">Mujer</p>
          </div>
          <div key="cat-ninos" className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{analytics.categoriesCount.ninos}</p>
            <p className="text-sm text-gray-600">Niños</p>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Recientes</h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div key={`recent-${product.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(product.images[0])}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? 'En stock' : 'Agotado'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Products List */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Productos ({products.length})
            </h2>
            <Button onClick={handleCreate} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
            {products.map((product, index) => (
              <div key={`product-${product.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {product.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'En stock' : 'Agotado'}
                      </span>
                      {product.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      disabled={isLoading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading && editingProduct?.id === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Create Form */}
      <div className="xl:col-span-1">
        {(isEditing || isCreating) && (
          <div className="bg-white rounded-xl shadow-md sticky top-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isCreating ? 'Crear Producto' : 'Editar Producto'}
                </h2>
                <button
                  onClick={resetForm}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form className="space-y-4">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Descripción del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (S/) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="ninos">Niños</option>
                    </select>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Imágenes
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {(formData.images || []).map((image, index) => (
                      <div key={`image-${index}-${image}`} className="relative group flex-shrink-0">
                        <img
                          src={getImageUrl(image)}
                          alt={`Imagen ${index + 1}`}
                          className="w-20 h-20 object-cover rounded cursor-pointer border-2 border-gray-200 hover:border-blue-500"
                          onClick={() => setPreviewImage(image)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isLoading}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 hover:text-red-800 shadow group-hover:opacity-100 opacity-80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(image)}
                          className="absolute bottom-1 right-1 bg-white rounded-full p-1 text-blue-600 hover:text-blue-800 shadow group-hover:opacity-100 opacity-80"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal de previsualización de imagen */}
                {previewImage && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewImage(null)}>
                    <div className="relative">
                      <img src={getImageUrl(previewImage)} alt="Vista previa" className="max-w-[90vw] max-h-[80vh] rounded shadow-lg" />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 hover:text-red-600 shadow"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sizes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tallas
                    </label>
                    <button
                      type="button"
                      onClick={addSize}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.sizes?.map((size, index) => (
                      <div key={`size-${size.id || index}`} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={size.name}
                          onChange={(e) => updateSize(index, 'name', e.target.value)}
                          disabled={isLoading}
                          placeholder="Talla"
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                        />
                        <input
                          type="number"
                          value={size.stock}
                          onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          placeholder="Stock"
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Colores
                    </label>
                    <button
                      type="button"
                      onClick={addColor}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.colors?.map((color, index) => (
                      <div key={`color-${color.id || index}`} className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColor(index, 'hex', e.target.value)}
                          disabled={isLoading}
                          className="w-8 h-8 border border-gray-300 rounded disabled:opacity-50"
                        />
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) => updateColor(index, 'name', e.target.value)}
                          disabled={isLoading}
                          placeholder="Nombre del color"
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                        />
                        <input
                          type="number"
                          value={color.stock}
                          onChange={(e) => updateColor(index, 'stock', parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          placeholder="Stock"
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock || false}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">En stock</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured || false}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Producto destacado</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetForm} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'products'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Productos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
      </div>
    </div>
  );
};
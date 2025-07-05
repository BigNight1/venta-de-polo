import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, Package, TrendingUp, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useAdminInfo } from '../../context/AdminInfoContext';
import { getImageUrl } from '../../lib/getImageUrl';
import { OrdersPanel } from './OrdersPanel';
import Swal from 'sweetalert2';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'analytics' | 'orders'>('overview');
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
  } = useAdminInfo();

  // --- VARIANTES ---
  const COLOR_MAP: Record<string, string> = {
    'BLANCO': '#FFFFFF',
    'NEGRO': '#000000',
    'ROJO': '#DC2626',
    'AZUL': '#2563EB',
    'VERDE': '#16A34A',
    'ROSA': '#EC4899',
    'AMARILLO': '#EAB308',
    'MORADO': '#9333EA',
    // Puedes agregar más colores estándar aquí
  };

  const [variantForm, setVariantForm] = useState({ size: '', color: '', stock: 1 });
  const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(null);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [variantError, setVariantError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const handleVariantInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({ ...prev, [name]: name === 'stock' ? Number(value) : value }));
  };

  const handleAddOrUpdateVariant = () => {
    if (!variantForm.size || !variantForm.color || variantForm.stock < 1) return;
    const newVariant = {
      size: variantForm.size.toUpperCase(),
      color: variantForm.color,
      stock: variantForm.stock,
    };
    if (editingVariantIdx !== null) {
      // Actualizar variante existente
      const updated = [...(formData.variants || [])];
      updated[editingVariantIdx] = newVariant;
      updateFormData({ variants: updated });
      setEditingVariantIdx(null);
    } else {
      // Agregar nueva variante
      updateFormData({
        variants: [
          ...(formData.variants || []),
          newVariant
        ]
      });
    }
    setVariantForm({ size: '', color: '', stock: 1 });
  };

  const handleEditVariant = (idx: number) => {
    const v = (formData.variants || [])[idx];
    setVariantForm({ size: v.size, color: v.color, stock: v.stock });
    setEditingVariantIdx(idx);
  };

  const handleRemoveVariant = (idx: number) => {
    updateFormData({
      variants: (formData.variants || []).filter((_, i) => i !== idx)
    });
    if (editingVariantIdx === idx) {
      setEditingVariantIdx(null);
      setVariantForm({ size: '', color: '', stock: 1 });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    if (!formData.variants || formData.variants.length === 0) {
      setVariantError('Debes agregar al menos una variante.');
      return;
    } else {
      setVariantError('');
    }
    try {
      console.log('Guardando producto:', formData);
      if (editingProduct && editingProduct._id) {
        await updateProduct(editingProduct._id, formData);
        setSaveSuccess('Producto actualizado correctamente.');
      } else {
        await createProduct(formData);
        setSaveSuccess('Producto guardado correctamente.');
      }
      setTimeout(() => setSaveSuccess(''), 2000);
      resetForm();
    } catch (err: any) {
      setSaveError(err?.message || 'Error al guardar el producto.');
      console.error('Error al guardar producto:', err);
    }
  };

  const handleDelete = async (productId: string) => {
    setDeleteError('');
    setDeleteSuccess('');
    // SweetAlert2 confirmación
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'No',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteProduct(productId);
      setDeleteSuccess('Producto eliminado correctamente.');
      setTimeout(() => setDeleteSuccess(''), 2000);
      resetForm();
    } catch (err: any) {
      setDeleteError(err?.message || 'Error al eliminar el producto.');
      console.error('Error al eliminar producto:', err);
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
    setImageUploadError('');
    setImageUploading(true);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setImageUploading(false);
      return;
    }
    const token = localStorage.getItem('admin_token');
    const uploadedPaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formDataFile = new FormData();
      formDataFile.append('file', file);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          body: formDataFile,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 401) {
          setImageUploadError('No autorizado para subir imágenes. Inicia sesión como admin.');
          setImageUploading(false);
          return;
        }
        if (!res.ok) {
          setImageUploadError('Error al subir la imagen.');
          setImageUploading(false);
          return;
        }
        const data = await res.json();
        if (data.filePath) {
          uploadedPaths.push(data.filePath);
        } else {
          setImageUploadError('No se recibió la ruta de la imagen.');
        }
      } catch (err) {
        setImageUploadError('Error al subir la imagen.');
      }
    }
    if (uploadedPaths.length > 0) {
      const currentImages = formData.images || [];
      const newImages = [...currentImages, ...uploadedPaths];
      updateFormData({ images: newImages });
    }
    setImageUploading(false);
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
            <div key={`recent-${product._id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(product.images[0] || '')}
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
              <div key={`product-${product._id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(product.images[0] || '')}
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
                      {isLoading && editingProduct?._id === product._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
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
              <form onSubmit={handleSave} className="space-y-4">
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

                {/* Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
                  <div className="flex items-center overflow-x-auto space-x-3 pb-2">
                    {/* Imágenes existentes */}
                    {formData.images && formData.images.map((image, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <img
                          src={getImageUrl(image)}
                          alt={`Imagen ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => setPreviewImage(image)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images?.filter((_, i) => i !== index) || [];
                            updateFormData({ images: newImages });
                          }}
                          className="absolute -top-[0px] -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {/* Cuadro '+' para agregar nueva imagen */}
                    <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 flex-shrink-0 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          setImageUploadError('');
                          setImageUploading(true);
                          const file = e.target.files?.[0];
                          if (!file) {
                            setImageUploading(false);
                            return;
                          }
                          const token = localStorage.getItem('admin_token');
                          const formDataFile = new FormData();
                          formDataFile.append('file', file);
                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                              method: 'POST',
                              body: formDataFile,
                              headers: token ? { Authorization: `Bearer ${token}` } : {},
                            });
                            if (res.status === 401) {
                              setImageUploadError('No autorizado para subir imágenes. Inicia sesión como admin.');
                              setImageUploading(false);
                              return;
                            }
                            if (!res.ok) {
                              setImageUploadError('Error al subir la imagen.');
                              setImageUploading(false);
                              return;
                            }
                            const data = await res.json();
                            if (data.filePath) {
                              const currentImages = formData.images || [];
                              const newImages = [...currentImages, data.filePath];
                              updateFormData({ images: newImages });
                            } else {
                              setImageUploadError('No se recibió la ruta de la imagen.');
                            }
                          } catch (err) {
                            setImageUploadError('Error al subir la imagen.');
                          }
                          setImageUploading(false);
                          e.target.value = '';
                        }}
                        disabled={isLoading || imageUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  {imageUploading && <div className="text-blue-500 text-xs mt-1">Subiendo imagen...</div>}
                  {imageUploadError && <div className="text-red-500 text-xs mt-1">{imageUploadError}</div>}
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

                {/* Variantes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Variantes (Talla, Color, Stock)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      name="size"
                      value={variantForm.size}
                      onChange={handleVariantInput}
                      placeholder="Talla"
                      className="px-2 py-1 border rounded w-20"
                    />
                    <input
                      type="text"
                      name="color"
                      value={variantForm.color}
                      onChange={handleVariantInput}
                      placeholder="Color"
                      className="px-2 py-1 border rounded w-24"
                    />
                    <input
                      type="number"
                      name="stock"
                      value={variantForm.stock}
                      min={1}
                      onChange={handleVariantInput}
                      placeholder="Stock"
                      className="px-2 py-1 border rounded w-16"
                    />
                    <Button type="button" onClick={handleAddOrUpdateVariant} className="px-3">
                      {editingVariantIdx !== null ? 'Actualizar' : 'Agregar'}
                    </Button>
                    {editingVariantIdx !== null && (
                      <Button type="button" variant="outline" onClick={() => { setEditingVariantIdx(null); setVariantForm({ size: '', color: '', stock: 1 }); }} className="px-3">Cancelar</Button>
                    )}
                  </div>
                  {/* Lista de variantes */}
                  {(formData.variants || []).length > 0 && (
                    <div className="border rounded p-2 bg-gray-50">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left">Talla</th>
                            <th className="text-left">Color</th>
                            <th className="text-left">Stock</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.variants || []).map((v, idx) => (
                            <tr key={idx}>
                              <td>{v.size}</td>
                              <td>
                                <span className="inline-flex items-center gap-1">
                                  <span style={{ background: COLOR_MAP[v.color.toUpperCase()] || '#F3F4F6', border: '1px solid #ccc', display: 'inline-block', width: 16, height: 16, borderRadius: '50%' }} />
                                  <span>{v.color}</span>
                                </span>
                              </td>
                              <td>{v.stock}</td>
                              <td>
                                <button type="button" onClick={() => handleEditVariant(idx)} className="text-blue-500 hover:underline mr-2">Editar</button>
                                <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 hover:underline">Eliminar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.price || !formData.images || !formData.category || !(formData.variants && formData.variants.length > 0)}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </Button>
                  {variantError && <div className="text-red-500 text-xs mt-1">{variantError}</div>}
                  {saveError && <div className="text-red-500 text-xs mt-1">{saveError}</div>}
                  {saveSuccess && <div className="text-green-600 text-xs mt-1">{saveSuccess}</div>}
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
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pedidos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'orders' && <OrdersPanel />}
      </div>
    </div>
  );
};
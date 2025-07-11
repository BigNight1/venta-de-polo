import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "../../lib/utils";
import { Button } from "../ui/Button";
import { COLOR_MAP } from "../../lib/colors";
import { useAdminInfo } from "../../hooks/useAdminInfo";
import { OrdersPanel } from "./OrdersPanel";
import Swal from "sweetalert2";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Esquema de validación Yup
const variantSchema = yup.object().shape({
  size: yup.string().required("Falta la talla"),
  color: yup.string().required("Falta el color"),
  stock: yup
    .number()
    .typeError("Falta el stock")
    .required("Falta el stock")
    .min(1, "El stock debe ser mayor a 0"),
});
const productImageSchema = yup.object().shape({
  url: yup.string().required("Falta la URL de la imagen"),
  public_id: yup.string().required("Falta el public_id de la imagen"),
});
const productSchema = yup.object().shape({
  name: yup.string().required("Falta rellenar el nombre"),
  description: yup.string().required("Falta rellenar la descripción"),
  price: yup
    .number()
    .typeError("Pon un precio mayor a 0")
    .required("Pon un precio mayor a 0")
    .min(1, "Pon un precio mayor a 0"),
  images: yup
    .array()
    .of(productImageSchema)
    .min(1, "Falta agregar al menos una imagen")
    .required(),
  category: yup
    .mixed<"hombre" | "mujer" | "ninos">()
    .oneOf(["hombre", "mujer", "ninos"], "Falta seleccionar la categoría")
    .required("Falta seleccionar la categoría"),
  variants: yup
    .array()
    .of(variantSchema)
    .min(1, "Debes agregar al menos una variante")
    .required(),
  inStock: yup.boolean().required(),
  featured: yup.boolean().required(),
});

interface ProductImage {
  url: string;
  public_id: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  category: "hombre" | "mujer" | "ninos";
  variants: { size: string; color: string; stock: number }[];
  inStock: boolean;
  featured: boolean;
  material?: string;
  cuidado?: string;
  origen?: string;
  estilo?: string;
}

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "analytics" | "orders"
  >("overview");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    products,
    isLoading,
    error,
    editingProduct,
    isEditing,
    isCreating,
    analytics,
    handleEdit,
    handleCreate,
    resetForm,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProducts, // <-- agregar fetchProducts
  } = useAdminInfo();

  // --- VARIANTES ---
  const [variantForm, setVariantForm] = useState({
    size: "",
    color: "",
    stock: 1,
  });
  const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(
    null
  );
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(
    null
  );
  const [deleteImageError, setDeleteImageError] = useState("");

  const defaultValues: ProductForm = {
    name: "",
    description: "",
    price: 0,
    images: [],
    category: "hombre",
    variants: [],
    inStock: true,
    featured: false,
  };

  const formMethods = useForm<ProductForm>({
    resolver: yupResolver(productSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Inicializar useFieldArray para variantes
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: formMethods.control,
    name: "variants",
  });

  const handleVariantInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) : value,
    }));
  };

  // handleAddVariant y handleUpdateVariant
  const handleAddVariant = () => {
    if (!variantForm.size || !variantForm.color || variantForm.stock < 1)
      return;
    appendVariant({
      size: variantForm.size.toUpperCase(),
      color: variantForm.color.trim().toUpperCase(),
      stock: variantForm.stock,
    });
    setVariantForm({ size: "", color: "", stock: 1 });
  };
  const handleUpdateVariant = () => {
    if (editingVariantIdx === null) return;
    removeVariant(editingVariantIdx);
    appendVariant({
      size: variantForm.size.toUpperCase(),
      color: variantForm.color.trim().toUpperCase(),
      stock: variantForm.stock,
    });
    setEditingVariantIdx(null);
    setVariantForm({ size: "", color: "", stock: 1 });
  };

  const handleSave = async (data: ProductForm) => {
    setSaveError("");
    setSaveSuccess("");
    try {
      if (editingProduct && editingProduct._id) {
        await updateProduct(editingProduct._id, data);
        await fetchProducts();
        setSaveSuccess("Producto actualizado correctamente.");
      } else {
        await createProduct(data);
        await fetchProducts();
        setSaveSuccess("Producto guardado correctamente.");
        resetForm(); // Limpiar el formulario tras crear
      }
      setTimeout(() => setSaveSuccess(""), 2000);
    } catch (err: any) {
      setSaveError(err?.message || "Error al guardar el producto.");
      console.error("Error al guardar producto:", err);
    }
  };

  const handleDelete = async (productId: string) => {
    // SweetAlert2 confirmación
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "No",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteProduct(productId);
      setTimeout(() => setSaveSuccess(""), 2000);
      resetForm();
    } catch (err: any) {
      setSaveError(err?.message || "Error al eliminar el producto.");
      console.error("Error al eliminar producto:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError("");
    setImageUploading(true);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setImageUploading(false);
      return;
    }
    // Cloudinary config
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const folder = "Venta_Polos";
    const uploadedImages: { url: string; public_id: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url && data.public_id) {
          uploadedImages.push({
            url: data.secure_url,
            public_id: data.public_id,
          });
        } else {
          setImageUploadError(
            "No se recibió la URL o el public_id de la imagen."
          );
        }
      } catch (err) {
        setImageUploadError("Error al subir la imagen a Cloudinary.");
      }
    }
    if (uploadedImages.length > 0) {
      const currentImages = formMethods.getValues("images") || [];
      const newImages = [...currentImages, ...uploadedImages];
      formMethods.setValue("images", newImages, { shouldValidate: true });
    }
    setImageUploading(false);
    e.target.value = "";
  };

  // Mostrar errores de validación de Yup en el recuadro rojo de la izquierda
  const collectYupErrors = (errs: any): string[] => {
    if (!errs) return [];
    let messages: string[] = [];
    Object.values(errs).forEach((err: any) => {
      if (err?.message) messages.push(err.message);
      if (typeof err === "object" && err !== null) {
        if (Array.isArray(err)) {
          err.forEach((item) => {
            if (item && typeof item === "object") {
              messages = messages.concat(collectYupErrors(item));
            }
          });
        } else if (err && typeof err === "object" && !err.message) {
          messages = messages.concat(collectYupErrors(err));
        }
      }
    });
    return messages;
  };
  const yupErrorMessages = collectYupErrors(formMethods.formState.errors);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Productos
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {analytics.totalProducts}
              </p>
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
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                {analytics.inStockProducts}
              </p>
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
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">
                {analytics.outOfStockProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Precio Promedio
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
                {formatPrice(analytics.averagePrice)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Categorías
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div
            key="cat-hombre"
            className="text-center p-4 bg-blue-50 rounded-lg"
          >
            <p className="text-2xl font-bold text-blue-600">
              {analytics.categoriesCount.hombre}
            </p>
            <p className="text-sm text-gray-600">Hombre</p>
          </div>
          <div
            key="cat-mujer"
            className="text-center p-4 bg-pink-50 rounded-lg"
          >
            <p className="text-2xl font-bold text-pink-600">
              {analytics.categoriesCount.mujer}
            </p>
            <p className="text-sm text-gray-600">Mujer</p>
          </div>
          <div
            key="cat-ninos"
            className="text-center p-4 bg-green-50 rounded-lg"
          >
            <p className="text-2xl font-bold text-green-600">
              {analytics.categoriesCount.ninos}
            </p>
            <p className="text-sm text-gray-600">Niños</p>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Productos Recientes
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto sm:max-h-none">
          {products.slice().map((product, index) => {
            const isOutOfStock =
              product.variants &&
              product.variants.length > 0 &&
              product.variants.every((variant) => variant.stock === 0);
            return (
              <div
                key={`recent-${product._id}-${index}`}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <img
                  src={product.images[0]?.url || ""}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isOutOfStock
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isOutOfStock ? "Sin stock" : "En stock"}
                </span>
              </div>
            );
          })}
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
          {/* Mostrar errores de validación de Yup y del backend aquí */}
          {(yupErrorMessages.length > 0 || error) && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-2">
              {yupErrorMessages.length > 0 && (
                <ul className="list-disc pl-5 text-red-700 text-sm">
                  {yupErrorMessages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
              {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
            </div>
          )}

          <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
            {products.map((product, index) => {
              const isOutOfStock =
                product.variants &&
                product.variants.length > 0 &&
                product.variants.every((variant) => variant.stock === 0);
              return (
                <div
                  key={`product-${product._id}-${index}`}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.images[0]?.url || ""}
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
                        <span
                          className={`badge ${
                            isOutOfStock
                              ? "bg-red-100 text-red-800 px-2 py-1 rounded-full"
                              : "bg-green-100 text-green-800 px-2 py-1 rounded-full"
                          }`}
                        >
                          {isOutOfStock ? "Sin stock" : "En stock"}
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
              );
            })}
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
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {isCreating ? "Crear Producto" : "Editar Producto"}
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

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form
                onSubmit={formMethods.handleSubmit(handleSave)}
                className="space-y-4"
              >
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    {...formMethods.register("name")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    {...formMethods.register("description")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Descripción del producto"
                  />
                </div>
                {/* Características */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <input
                      {...formMethods.register("material")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Ej: 100% algodón"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuidado</label>
                    <input
                      {...formMethods.register("cuidado")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Ej: Lavable en máquina"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                    <input
                      {...formMethods.register("origen")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Ej: Fabricado en Perú"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estilo</label>
                    <input
                      {...formMethods.register("estilo")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Ej: Casual, Formal, Deportivo"
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes
                  </label>
                  <div className="flex items-center overflow-x-auto space-x-3 pb-2">
                    {/* Imágenes existentes */}
                    {formMethods.getValues("images") &&
                      formMethods.getValues("images").map((image, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <img
                            src={image.url}
                            alt={`Imagen ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => setPreviewImage(image.url)}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              setDeleteImageError("");
                              setDeletingImageIndex(index);
                              const images =
                                formMethods.getValues("images") || [];
                              const imageToDelete = images[index];
                              // Eliminar de Cloudinary si tiene public_id
                              if (imageToDelete && imageToDelete.public_id) {
                                try {
                                  const token =
                                    localStorage.getItem("admin_token");
                                  // Normalizar public_id: reemplazar espacios por guiones bajos
                                  const normalizedPublicId =
                                    imageToDelete.public_id.replace(
                                      /\s+/g,
                                      "_"
                                    );
                                  const res = await fetch(
                                    `${
                                      import.meta.env.VITE_API_URL
                                    }/upload/cloudinary/${normalizedPublicId}`,
                                    {
                                      method: "DELETE",
                                      headers: token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {},
                                    }
                                  );
                                  if (!res.ok) {
                                    setDeleteImageError(
                                      "Error al eliminar la imagen de Cloudinary"
                                    );
                                  }
                                } catch (err) {
                                  setDeleteImageError(
                                    "Error al eliminar la imagen de Cloudinary"
                                  );
                                }
                              }
                              const newImages = images.filter(
                                (_, i) => i !== index
                              );
                              formMethods.setValue("images", newImages, {
                                shouldValidate: true,
                              });
                              setDeletingImageIndex(null);
                            }}
                            className="absolute -top-[0px] -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                            disabled={deletingImageIndex === index}
                          >
                            {deletingImageIndex === index ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "×"
                            )}
                          </button>
                        </div>
                      ))}
                    {/* Cuadro '+' para agregar nueva imagen */}
                    <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 flex-shrink-0 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isLoading || imageUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  {imageUploading && (
                    <div className="text-blue-500 text-xs mt-1">
                      Subiendo imagen...
                    </div>
                  )}
                  {imageUploadError && (
                    <div className="text-red-500 text-xs mt-1">
                      {imageUploadError}
                    </div>
                  )}
                  {deleteImageError && (
                    <div className="text-red-500 text-xs mt-1">
                      {deleteImageError}
                    </div>
                  )}
                </div>

                {/* Modal de previsualización de imagen */}
                {previewImage && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={() => setPreviewImage(null)}
                  >
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Vista previa"
                        className="max-w-[90vw] max-h-[80vh] rounded shadow-lg"
                      />
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
                      {...formMethods.register("inStock")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">En stock</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...formMethods.register("featured")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Producto destacado
                    </span>
                  </label>
                </div>

                {/* Variantes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variantes (Talla, Color, Stock)
                  </label>
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
                    {editingVariantIdx === null ? (
                      <div className="flex justify-end mt-2">
                        <Button
                          type="button"
                          onClick={handleAddVariant}
                          className="px-3"
                        >
                          Agregar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          onClick={handleUpdateVariant}
                          className="px-3"
                        >
                          Actualizar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingVariantIdx(null);
                            setVariantForm({ size: "", color: "", stock: 1 });
                          }}
                          className="px-3"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Lista de variantes */}
                  {variantFields.length > 0 && (
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
                          {variantFields.map((v, idx) => (
                            <tr key={v.id}>
                              <td>{v.size}</td>
                              <td>
                                <span className="inline-flex items-center gap-1">
                                  <span
                                    style={{
                                      background:
                                        COLOR_MAP[v.color?.toUpperCase()] ||
                                        "#F3F4F6",
                                      border: "1px solid #ccc",
                                      display: "inline-block",
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                    }}
                                  />
                                  <span>{v.color}</span>
                                </span>
                              </td>
                              <td>{v.stock}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVariantForm({
                                      size: v.size,
                                      color: v.color,
                                      stock: v.stock,
                                    });
                                    setEditingVariantIdx(idx);
                                  }}
                                  className="text-blue-500 hover:underline mr-2"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVariant(idx)}
                                  className="text-red-500 hover:underline"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Botón Guardar y mensajes de error */}
                <div className="flex items-center space-x-4 mt-4">
                  <Button type="submit" color="primary" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar"}
                  </Button>
                  {saveError && (
                    <div className="text-red-500 text-sm">
                      {Array.isArray(saveError)
                        ? saveError.map((msg, idx) => (
                            <div key={idx}>{msg}</div>
                          ))
                        : saveError}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (isEditing && editingProduct) {
      formMethods.reset({
        ...editingProduct,
        price: editingProduct.price || 0,
        images: editingProduct.images || [],
        variants: editingProduct.variants || [],
        inStock: editingProduct.inStock ?? true,
        featured: editingProduct.featured ?? false,
      });
    } else if (isCreating) {
      formMethods.reset(defaultValues);
    }
  }, [isEditing, editingProduct, isCreating]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between  flex-col sm:flex-row">
            <h1 className="text-2xl font-bold text-gray-900">
              Panel Administrativo
            </h1>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "overview"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "products"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Productos
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "orders"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pedidos
              </button>
             
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "orders" && <OrdersPanel />}
      </div>
    </div>
  );
};

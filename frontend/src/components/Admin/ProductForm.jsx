import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';
import './ProductForm.css';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const { backendUrl } = useApi();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precioAnterior: '',
    descuento: '',
    categoria: 'Hombre',
    tipo: 'Polo',
    tallas: [],
    imagen: '',
    stock: '',
    destacado: false,
    activo: true
  });
  const [selectedTallas, setSelectedTallas] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef();

  const categorias = ['Hombre', 'Mujer', 'Infantil', 'Unisex'];
  const tipos = ['Polo', 'Camisa', 'Polera', 'Camiseta'];
  const tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        precioAnterior: product.precioAnterior || '',
        descuento: product.descuento || '',
        categoria: product.categoria || 'Hombre',
        tipo: product.tipo || 'Polo',
        tallas: product.tallas || [],
        imagen: product.imagen || '',
        stock: product.stock || '',
        destacado: product.destacado || false,
        activo: product.activo !== undefined ? product.activo : true
      });
      setSelectedTallas(product.tallas || []);
      setImagePreview(product.imagen ? `${backendUrl}${product.imagen}` : '');      setImageFile(null);
      console.log('Editando producto, datos cargados:', product);
    } else {
      setImagePreview('');
      setImageFile(null);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTallaChange = (talla) => {
    setSelectedTallas(prev => {
      if (prev.includes(talla)) {
        return prev.filter(t => t !== talla);
      } else {
        return [...prev, talla];
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      console.log('Imagen seleccionada para subir:', file);
    }
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.imagen;
    // Si hay una nueva imagen seleccionada, súbela
    if (imageFile) {
      const formDataImg = new FormData();
      formDataImg.append('file', imageFile);
      const res = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataImg
      });
      if (res.ok) {
        const data = await res.json();
        imageUrl = data.filePath;
        console.log('Imagen subida, filePath recibido:', data);
      } else {
        alert('Error subiendo la imagen');
        return;
      }
    }
    const submitData = {
      ...formData,
      imagen: imageUrl,
      tallas: selectedTallas,
      precio: parseFloat(formData.precio),
      precioAnterior: formData.precioAnterior ? parseFloat(formData.precioAnterior) : undefined,
      descuento: formData.descuento ? parseFloat(formData.descuento) : undefined,
      stock: formData.stock ? parseInt(formData.stock) : undefined
    };
    console.log('Datos enviados al backend al guardar producto:', submitData);
    onSubmit(submitData);
  };

  return (
    <div className="product-form-overlay">
      <div className="product-form">
        <div className="form-header">
          <h3>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        {/* Imagen y botón cambiar imagen */}
        <div className="image-upload-section">
          <div className="image-preview-container">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">Sin imagen</div>
            )}
            <button className="change-image-btn" onClick={handleImageClick} type="button">
              <span role="img" aria-label="cambiar">📷</span> Cambiar imagen
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Precio *</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
              >
                {tipos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio Anterior</label>
              <input
                type="number"
                name="precioAnterior"
                value={formData.precioAnterior}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Descuento (%)</label>
              <input
                type="number"
                name="descuento"
                value={formData.descuento}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* El campo URL de imagen ahora está oculto */}
          {/* /* <div className="form-group">
            <label>URL de Imagen</label>
            <input
              type="text"
              name="imagen"
              value={imagePreview || formData.imagen}
              readOnly
            />
          </div> */ }

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Tallas Disponibles *</label>
            <div className="tallas-grid">
              {tallasDisponibles.map(talla => (
                <label key={talla} className="talla-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTallas.includes(talla)}
                    onChange={() => handleTallaChange(talla)}
                  />
                  {talla}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleInputChange}
                />
                Producto Destacado
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                />
                Producto Activo
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              {product ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 
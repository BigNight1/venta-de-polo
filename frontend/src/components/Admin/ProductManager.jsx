import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../context/ApiContext';
import ProductForm from './ProductForm';
import './ProductManager.css';

const ProductManager = () => {
  const { token } = useAuth();
  const { backendUrl } = useApi();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Error al cargar productos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        setError('Error al eliminar producto');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = async (productData) => {
    try {
      let response;
      if (editingProduct) {
        // Actualizar producto existente
        response = await fetch(`${backendUrl}/products/${editingProduct._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Crear nuevo producto
        response = await fetch(`${backendUrl}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        await fetchProducts();
        setShowForm(false);
        setEditingProduct(null);
      } else {
        setError('Error al guardar producto');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="product-manager">
      <div className="product-manager-header">
        <h2>Gestión de Productos</h2>
        <button 
          className="add-product-btn"
          onClick={() => setShowForm(true)}
        >
          + Agregar Producto
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img 
                    src={`${backendUrl}${product.imagen}`} 
                    alt={`${backendUrl}${product.imagen}`}
                    className="product-thumbnail"
                    onError={e => { console.log('Error cargando imagen:', e.target.src); }}
                  />
                </td>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>${product.precio}</td>
                <td>{product.stock || 0}</td>
                <td>
                  <span className={`status ${product.activo ? 'active' : 'inactive'}`}>
                    {product.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(product._id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager; 
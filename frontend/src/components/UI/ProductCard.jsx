import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext';
import './ProductCard.css';

function ProductCard({ polo }) {
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCart();
  const { backendUrl } = useApi();
  const [tallaSeleccionada, setTallaSeleccionada] = useState(polo.tallas[0] || '');

  const handleAddCart = (e) => {
    e.stopPropagation();
    agregarAlCarrito({ ...polo, talla: tallaSeleccionada, cantidad: 1 });
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/producto/${polo._id || polo.id}`)}
    >
      {polo.descuento && (
        <span className="product-discount">{polo.descuento}%</span>
      )}
      <div className="product-card-image-container">
        <img
          src={`${backendUrl}${polo.imagen}`}
          alt={polo.nombre}
          className="product-card-image"
        />
      </div>
      <div className="product-info" onClick={e => e.stopPropagation()}>
        <div className="product-main-row">
          <div className="product-title">{polo.nombre}</div>
          <div className="product-prices">
            {polo.precioAnterior && (
              <span className="product-old">S/ {polo.precioAnterior.toFixed(2)}</span>
            )}
            <span className="product-price">S/ {polo.precio.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="product-hover-panel" onClick={e => e.stopPropagation()}>
        <div className="product-sizes">Talla</div>
        <div className="product-tallas-list">
          {polo.tallas.map((t) => (
            <button
              key={t}
              className={`product-talla-btn${tallaSeleccionada === t ? ' selected' : ''}`}
              onClick={() => setTallaSeleccionada(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
        <button className="product-addcart-btn" onClick={handleAddCart} type="button">
          AGREGAR AL CARRITO
        </button>
      </div>
    </div>
  );
}

export default ProductCard; 
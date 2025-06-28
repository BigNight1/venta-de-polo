import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext';

function DetalleProducto() {
  const { id } = useParams();
  const { polos, loading } = useProducts();
  const { backendUrl } = useApi();
  const { agregarAlCarrito } = useCart();
  
  // Buscar por _id o id
  const polo = polos.find((p) => p._id === id || p.id === Number(id));
  const [talla, setTalla] = useState(polo?.tallas[0] || '');
  const [cantidad, setCantidad] = useState(1);

  if (loading) return <div className="detalle-notfound">Cargando producto...</div>;
  if (!polo) return <div className="detalle-notfound">Producto no encontrado</div>;

  return (
    <div className="detalle-container">
      <div className="detalle-imgbox">
        <img src={`${backendUrl}${polo.imagen}`} alt={polo.nombre} className="detalle-img" />
      </div>
      <div className="detalle-info">
        <div className="detalle-title">{polo.nombre}</div>
        <div className="detalle-desc">{polo.descripcion}</div>
        <div className="detalle-prices">
          {polo.precioAnterior && (
            <span className="detalle-old">S/ {polo.precioAnterior.toFixed(2)}</span>
          )}
          <span className="detalle-price">S/ {polo.precio.toFixed(2)}</span>
          {polo.descuento && (
            <span className="detalle-discount">{polo.descuento}%</span>
          )}
        </div>
        <div className="detalle-tallas">
          <span>Talla:</span>
          {polo.tallas.map((t) => (
            <button
              key={t}
              onClick={() => setTalla(t)}
              className={talla === t ? 'talla-btn selected' : 'talla-btn'}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="detalle-cantidad">
          <span>Cantidad:</span>
          <button onClick={() => setCantidad((c) => (c > 1 ? c - 1 : 1))} className="cantidad-btn">-</button>
          <input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value) || 1)} className="cantidad-input" />
          <button onClick={() => setCantidad((c) => c + 1)} className="cantidad-btn">+</button>
        </div>
        <button
          onClick={() => agregarAlCarrito({ ...polo, talla, cantidad })}
          className="detalle-addcart"
        >
          AGREGAR AL CARRITO
        </button>
      </div>
    </div>
  );
}

export default DetalleProducto; 
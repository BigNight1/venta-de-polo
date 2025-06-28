import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext'; 


function CarritoSidebar() {
  const { 
    carrito, 
    sidebarAbierto, 
    cerrarSidebar, 
    quitarDelCarrito, 
    cambiarCantidad, 
    finalizarCompra, 
    mensajeCompra 
  } = useCart();


  const {backendUrl} = useApi();
  return (
    <div className={sidebarAbierto ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-header">
        <h2>Tu carrito</h2>
        <button onClick={cerrarSidebar} className="sidebar-close"><FaTimes /></button>
      </div>
      <div className="sidebar-body">
        {carrito.length === 0 ? (
          <p className="sidebar-empty">Tu carrito está vacío.</p>
        ) : (
          <ul className="sidebar-list">
            {carrito.map((item, idx) => (
              <li key={item.id + item.talla + idx} className="sidebar-item">
                <img src={`${backendUrl}${item.imagen}`} alt={item.nombre} className="sidebar-img" />
                <div className="sidebar-info">
                  <div className="sidebar-title">{item.nombre}</div>
                  <div className="sidebar-talla">Talla: {item.talla}</div>
                  <div className="sidebar-precio">Precio: S/ {item.precio.toFixed(2)}</div>
                  <div className="sidebar-cantidad">
                    <button onClick={() => cambiarCantidad(item.id, item.talla, item.cantidad - 1)} className="cantidad-btn">-</button>
                    <input type="number" min={1} value={item.cantidad} onChange={e => cambiarCantidad(item.id, item.talla, parseInt(e.target.value) || 1)} className="cantidad-input" />
                    <button onClick={() => cambiarCantidad(item.id, item.talla, item.cantidad + 1)} className="cantidad-btn">+</button>
                  </div>
                </div>
                <button onClick={() => quitarDelCarrito(item.id, item.talla)} className="sidebar-remove"><FaTimes /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-subtotal">
          Subtotal: S/ {carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0).toFixed(2)}
        </div>
        <button
          onClick={finalizarCompra}
          disabled={carrito.length === 0}
          className="sidebar-buy"
        >
          FINALIZA TU COMPRA
        </button>
        {mensajeCompra && (
          <div className="sidebar-success">{mensajeCompra}</div>
        )}
      </div>
    </div>
  );
}

export default CarritoSidebar; 
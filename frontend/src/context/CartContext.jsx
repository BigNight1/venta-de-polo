import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [mensajeCompra, setMensajeCompra] = useState('');

  const abrirSidebar = () => setSidebarAbierto(true);
  const cerrarSidebar = () => setSidebarAbierto(false);

  const agregarAlCarrito = (polo) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === polo.id && item.talla === polo.talla);
      if (existe) {
        return prev.map((item) =>
          item.id === polo.id && item.talla === polo.talla
            ? { ...item, cantidad: item.cantidad + (polo.cantidad || 1) }
            : item
        );
      }
      return [...prev, { ...polo, cantidad: polo.cantidad || 1 }];
    });
    abrirSidebar();
  };

  const quitarDelCarrito = (id, talla) => {
    setCarrito((prev) => prev.filter((item) => !(item.id === id && item.talla === talla)));
  };

  const cambiarCantidad = (id, talla, cantidad) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id && item.talla === talla ? { ...item, cantidad: cantidad < 1 ? 1 : cantidad } : item
      )
    );
  };

  const finalizarCompra = () => {
    setMensajeCompra('¡Gracias por tu compra! Pronto recibirás un correo de confirmación.');
    setCarrito([]);
    cerrarSidebar();
    setTimeout(() => setMensajeCompra(''), 4000);
  };

  const cartCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const value = {
    carrito,
    sidebarAbierto,
    mensajeCompra,
    cartCount,
    abrirSidebar,
    cerrarSidebar,
    agregarAlCarrito,
    quitarDelCarrito,
    cambiarCantidad,
    finalizarCompra,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 
import React, { useState } from 'react';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';

const categorias = [
  {
    nombre: 'Hombre',
    subcategorias: ['Polos', 'Camisas', 'Casacas', 'Chalecos', 'Poleras'],
  },
  {
    nombre: 'Mujer',
    subcategorias: ['Polos', 'Crop Top', 'Casacas', 'Poleras'],
  },
  {
    nombre: 'Infantil',
    subcategorias: ['Polos', 'Poleras'],
  },
  {
    nombre: 'Unisex',
    subcategorias: ['Polos', 'Oversize', 'Básico'],
  },
];

function Navbar() {
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState('');
  
  const { categoria, handleCategoriaSelect, handleBuscar } = useProducts();
  const { cartCount, abrirSidebar } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    handleBuscar(search);
  };

  return (
    <header className="navbar-shop">
      <div className="navbar-left">
        <a href="/">
        <span className="navbar-logo-text" onClick={() => handleCategoriaSelect(null, null)}>
          Tienda de Polos
        </span></a>
      </div>
      <nav className="navbar-cats-center">
        <ul>
          {categorias.map((cat) => (
            <li
              key={cat.nombre}
              className={categoria === cat.nombre ? 'active' : ''}
              onClick={() => handleCategoriaSelect(cat.nombre, null)}
            >
              {cat.nombre}
            </li>
          ))}
        </ul>
      </nav>
      <div className="navbar-right">
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit"><FaSearch /></button>
        </form>
        <div className="navbar-cart" onClick={abrirSidebar}>
          <FaShoppingCart />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
      </div>
    </header>
  );
}

export default Navbar; 
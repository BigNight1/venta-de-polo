import React from 'react';
import ProductCard from '../UI/ProductCard.jsx';
import { useProducts } from '../../context/ProductContext';

function Catalogo() {
  const { polosFiltrados, loading } = useProducts();

  if (loading) return <div className="catalogo-loader">Cargando productos...</div>;

  return (
    <main className="catalogo-grid">
      {polosFiltrados.map((polo) => (
        <ProductCard key={polo._id || polo.id} polo={polo} />
      ))}
    </main>
  );
}

export default Catalogo; 
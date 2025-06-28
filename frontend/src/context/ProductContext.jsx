import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from './ApiContext';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de un ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const { backendUrl } = useApi();
  const [polos, setPolos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [subcategoria, setSubcategoria] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/products`);
        if (response.ok) {
          const data = await response.json();
          setPolos(data);
        } else {
          setPolos([]);
        }
      } catch (error) {
        setPolos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [backendUrl]);

  // Filtrado de productos
  const polosFiltrados = polos.filter((polo) => {
    const coincideBusqueda = busqueda.trim() === '' || polo.nombre.toLowerCase().includes(busqueda.toLowerCase());
    if (!categoria && !subcategoria) return coincideBusqueda;
    if (categoria && !subcategoria) return polo.categoria === categoria && coincideBusqueda;
    if (categoria && subcategoria) return polo.categoria === categoria && (polo.tipo === subcategoria || polo.tipo === subcategoria) && coincideBusqueda;
    return coincideBusqueda;
  });

  const handleCategoriaSelect = (cat, sub) => {
    setCategoria(cat);
    setSubcategoria(sub);
    setBusqueda('');
  };

  const handleBuscar = (valor) => {
    setBusqueda(valor);
    setCategoria(null);
    setSubcategoria(null);
  };

  const value = {
    polos,
    polosFiltrados,
    categoria,
    subcategoria,
    busqueda,
    handleCategoriaSelect,
    handleBuscar,
    loading,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}; 
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import {  useNavigate } from 'react-router-dom';

export const MyOrders: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setOrder(null);
    if (!orderId.trim()) {
      setError('Por favor ingresa el código de tu pedido.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId.trim()}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError('No se encontró un pedido con ese código.');
        setOrder(null);
      } else {
        navigate(`/order/${orderId.trim()}`);
      }
    } catch (err) {
      setError('Error al buscar el pedido.');
      setOrder(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consulta tu Pedido</h1>
          <p className="text-gray-600 mb-4">
            Ingresa el código de tu pedido para ver el estado y los detalles.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Ej: ORD-1234567890"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
          {error && <div className="text-red-600 mb-4">{error}</div>}
        </div>

       
      </div>
    </div>
  );
};
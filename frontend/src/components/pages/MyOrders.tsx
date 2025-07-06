import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';

export const MyOrders: React.FC = () => {
  const { user: firebaseUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!firebaseUser) return;
      console.log('UID autenticado:', firebaseUser.uid);
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/user/${firebaseUser.uid}`);
        const data = await res.json();
        console.log('Pedidos recibidos del backend:', data);
        setOrders(data);
      } catch (err) {
        setError('Error al cargar tus pedidos.');
      }
      setLoading(false);
    };
    fetchOrders();
  }, [firebaseUser]);

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-2">Inicia sesión para ver tus pedidos</h2>
          <p className="text-gray-600 mb-4">Debes iniciar sesión con Google para ver el historial de tus pedidos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Pedidos</h1>
        {loading && <div className="mb-4">Cargando pedidos...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {orders.length === 0 && !loading && (
          <div className="text-gray-600">No tienes pedidos registrados.</div>
        )}
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.orderId} className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold text-blue-600">Pedido:</span> {order.orderId}
                </div>
                <span className="text-sm px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">{order.status}</span>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Fecha:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Total:</span> S/ {order.total}
              </div>
              <Button onClick={() => navigate(`/order/${order.orderId}`)} className="mt-2">Ver Detalle</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
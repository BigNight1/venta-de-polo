import React from 'react';
import { Package, Calendar, CreditCard, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice, formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';

// Mock orders data - en producción vendría de Supabase
const mockOrders = [
  {
    id: 'ORD-1234567890',
    items: [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Polo Clásico Algodón',
          images: ['https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg'],
        },
        sizeId: 'm',
        colorId: 'white',
        quantity: 2,
        unitPrice: 29.99,
      },
    ],
    total: 59.98,
    status: 'delivered' as const,
    createdAt: '2024-01-15T10:30:00Z',
    shippingAddress: {
      street: 'Calle Mayor 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'España',
    },
  },
  {
    id: 'ORD-0987654321',
    items: [
      {
        id: '2',
        product: {
          id: '3',
          name: 'Polo Elegante Mujer',
          images: ['https://images.pexels.com/photos/5668860/pexels-photo-5668860.jpeg'],
        },
        sizeId: 's',
        colorId: 'pink',
        quantity: 1,
        unitPrice: 34.99,
      },
    ],
    total: 34.99,
    status: 'shipped' as const,
    createdAt: '2024-01-20T14:15:00Z',
    shippingAddress: {
      street: 'Avenida de la Paz 456',
      city: 'Barcelona',
      state: 'Cataluña',
      zipCode: '08001',
      country: 'España',
    },
  },
];

export const MyOrders: React.FC = () => {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión para ver tus pedidos
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas estar autenticado para acceder a esta página
          </p>
          <Button onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">
            Revisa el estado de tus pedidos y el historial de compras
          </p>
        </div>

        {/* Orders List */}
        {mockOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes pedidos aún
            </h3>
            <p className="text-gray-500 mb-6">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
            <Button onClick={() => window.history.back()}>
              Continuar comprando
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido {order.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-sm text-gray-500">
                            Talla: {item.sizeId.toUpperCase()} • Color: {item.colorId} • Cantidad: {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Dirección de envío
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Reordenar
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Cancelar pedido
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
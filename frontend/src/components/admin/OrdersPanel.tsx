import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Eye, 
  User, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { formatPrice, formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { getImageUrl } from '../../lib/getImageUrl';

// Tipos para los pedidos
interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  sizeId: string;
  sizeName: string;
  colorId: string;
  colorName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  orderId: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  payment?: {
    method: string;
    status: string;
  };
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  shipping?: {
    firstName?: string;
    lastName?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    identityType?: string;
    identityCode?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    identityType?: string;
    identityCode?: string;
  };
  subtotal: number;
  shippingCost: number;
}

const orderStatuses = [
  { id: 'all', label: 'Todos los Estados', color: 'gray' },
  { id: 'pending', label: 'Pendiente', color: 'yellow' },
  { id: 'confirmed', label: 'Confirmado', color: 'blue' },
  { id: 'preparing', label: 'Preparando Envío', color: 'purple' },
  { id: 'shipped', label: 'Enviado', color: 'indigo' },
  { id: 'delivered', label: 'Entregado', color: 'green' },
  { id: 'cancelled', label: 'Cancelado', color: 'red' },
];

export const OrdersPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [error, setError] = useState('');

  // Cargar pedidos del backend
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
      if (!response.ok) {
        throw new Error('Error al cargar los pedidos');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    loadOrders();
  }, []);

  // Filtrar y buscar pedidos
  useEffect(() => {
    let filtered = orders;

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Búsqueda por nombre o número de pedido
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, searchTerm]);

  // Paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.id === status);
    const color = statusObj?.color || 'gray';
    
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    
    return colors[color as keyof typeof colors];
  };

  const getStatusLabel = (status: string) => {
    const statusObj = orderStatuses.find(s => s.id === status);
    return statusObj?.label || status;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del pedido');
      }

     
      
      // Actualizar estado local
      const updatedOrders = orders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Actualizar orden seleccionada si está abierta
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Error al actualizar el estado del pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadOrders();
  };


  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      card: 'Tarjeta de Crédito',
      paypal: 'PayPal',
      transfer: 'Transferencia Bancaria',
    };
    return methods[method as keyof typeof methods] || method;
  };

  // Estadísticas rápidas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Estadísticas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <p className="text-gray-600">Administra y supervisa todos los pedidos de la tienda</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            {/* <Button
              variant="outline"
              onClick={handleExportOrders}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button> */}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Total Pedidos</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pendientes</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.confirmed}</div>
            <div className="text-sm text-purple-700">Confirmados</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{stats.shipped}</div>
            <div className="text-sm text-indigo-700">Enviados</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-green-700">Entregados</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{formatPrice(stats.totalRevenue)}</div>
            <div className="text-sm text-gray-700">Ingresos</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de pedido, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro por Estado */}
          <div className="md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {orderStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No se encontraron pedidos con los filtros aplicados'
                      : 'No hay pedidos registrados'
                    }
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  // Debug: log order
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || order.customer?.name || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email || order.customer?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getPaymentMethodLabel(order.payment?.method || order.paymentMethod || '')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        disabled={isLoading}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                      >
                        {orderStatuses.slice(1).map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {indexOfFirstOrder + 1} a {Math.min(indexOfLastOrder, filteredOrders.length)} de {filteredOrders.length} pedidos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles del Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles del Pedido
                  </h2>
                  <p className="text-gray-600">{selectedOrder.orderId}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información del Cliente */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Información del Cliente
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Nombre:</strong> {selectedOrder.user?.name || selectedOrder.customer?.name || '-'}</p>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedOrder.user?.email || selectedOrder.customer?.email || '-'}
                        </p>
                        <p className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedOrder.user?.phone || selectedOrder.customer?.phone || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Dirección de Envío */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Dirección de Envío
                      </h3>
                      <div className="text-sm text-gray-600">
                        <p>{selectedOrder.shipping?.address || selectedOrder.shippingAddress?.address || '-'}</p>
                        <p>{selectedOrder.shipping?.city || selectedOrder.shippingAddress?.city || '-'}, {selectedOrder.shipping?.state || selectedOrder.shippingAddress?.state || '-'}</p>
                        <p>{selectedOrder.shipping?.zipCode || selectedOrder.shippingAddress?.zipCode || '-'}</p>
                        <p>{selectedOrder.shipping?.country || selectedOrder.shippingAddress?.country || '-'}</p>
                      </div>
                    </div>

                    {/* Información del Pedido */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Información del Pedido
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Fecha:</strong> {formatDate(selectedOrder.createdAt)}</p>
                        <p><strong>Última actualización:</strong> {formatDate(selectedOrder.updatedAt)}</p>
                        <p className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                          {getPaymentMethodLabel(selectedOrder.payment?.method || selectedOrder.paymentMethod || '')}
                        </p>
                        <div className="flex items-center">
                          {getStatusIcon(selectedOrder.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusLabel(selectedOrder.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cambiar Estado */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Cambiar Estado
                      </h3>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.orderId, e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {orderStatuses.slice(1).map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Productos del Pedido */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Productos ({selectedOrder.items.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, idx: number) => {
                        // Debug: log item
                        if (!item.product) {
                          console.warn('Item sin product:', item);
                        }
                        const productName = item.product?.name || 'Producto eliminado';
                        const productImage = item.product?.images[0]
                        ? getImageUrl(item.product.images[0])
                        : '/placeholder.png';
                        return (
                          <div key={item.id || idx} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {productName}
                                </h4>
                                <div className="text-sm text-gray-500 mt-1">
                                  <span>Talla: {item.sizeName || item.size || '-'}</span>
                                  <span className="mx-2">•</span>
                                  <span>Color: {item.colorName || item.color || '-'}</span>
                                  <span className="mx-2">•</span>
                                  <span>Cantidad: {item.quantity}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Precio unitario: {formatPrice(item.product?.price || item.unitPrice || item.price || 0)}
                                </div>
                                {/* Debug info si hay error */}
                                {!item.product && (
                                  <div className="text-xs text-red-500 mt-2">
                                    <strong>Debug:</strong> item: {JSON.stringify(item)}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-medium text-gray-900">
                                  {formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumen de Precios */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Envío:</span>
                          <span>{selectedOrder.shippingCost === 0 ? 'Gratis' : formatPrice(selectedOrder.shippingCost)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>{formatPrice(selectedOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
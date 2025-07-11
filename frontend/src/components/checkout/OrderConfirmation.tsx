import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, Mail, Phone, Download, ArrowRight, Calendar, MapPin, CreditCard, Share2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice, formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const OrderConfirmation: React.FC = () => {
    const { orderId } = useParams();

    const [orderData, setOrderData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { setShowCheckout, setCartOpen } = useStore();

    useEffect(() => {
        if (!orderId) return;
        // Ya no guardar el pedido aquí
        setLoading(true);
        axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}`)
            .then(res => {
                setOrderData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setError('No se pudo cargar el pedido.');
                setLoading(false);
            });
    }, [orderId]);

    if (loading) return <div className="p-8 text-center">Cargando pedido...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!orderData) return null;

    const handleBackToCart = () => {
        setShowCheckout(false);
        setCartOpen(true);
    };

    const handleDownloadInvoice = () => {
        // Simular descarga de factura
        alert('Descargando factura PDF...');
    };

    const handleShareOrder = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Mi pedido en PoloStore',
                text: `¡Acabo de realizar un pedido en PoloStore! Pedido #${orderData.orderNumber}`,
                url: window.location.href,
            });
        } else {
            // Fallback para navegadores que no soportan Web Share API
            navigator.clipboard.writeText(`¡Acabo de realizar un pedido en PoloStore! Pedido #${orderData.orderNumber}`);
            alert('Enlace copiado al portapapeles');
        }
    };

    const trackingSteps = [
        { id: 1, key: 'confirmed', title: 'Pedido Confirmado' },
        { id: 2, key: 'preparing', title: 'Preparando Envío' },
        { id: 3, key: 'shipped', title: 'En Tránsito' },
        { id: 4, key: 'delivered', title: 'Entregado' },
    ];
    const currentStatus = orderData.status;
    const currentStepIndex = trackingSteps.findIndex(s => s.key === currentStatus);

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Gracias por tu compra
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Tu pedido ha sido procesado exitosamente.
                    </p>
                    <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Package className="h-4 w-4 mr-2" />
                        Pedido #{orderData.orderId}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Button
                        onClick={handleDownloadInvoice}
                        variant="outline"
                        className="flex items-center justify-center"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Factura
                    </Button>
                    <Button
                        onClick={handleShareOrder}
                        variant="outline"
                        className="flex items-center justify-center"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir Pedido
                    </Button>
                    <Button
                        onClick={handleBackToCart}
                        className="flex items-center justify-center"
                    >
                        Volver al Carrito
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Tracking */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Truck className="h-5 w-5 mr-2" />
                                Estado del Pedido
                            </h2>

                            <div className="space-y-4">
                                {trackingSteps.map((step, idx) => {
                                    const isCompleted = idx < currentStepIndex || (orderData.status === 'delivered' && idx === currentStepIndex);
                                    const isCurrent = idx === currentStepIndex;
                                    return (
                                        <div key={step.id} className="flex items-center">
                                            <div className={
                                                `w-8 h-8 rounded-full flex items-center justify-center
                                                ${isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-green-500 text-white border-green-500 border-2' : 'bg-gray-300 text-gray-400'}`
                                            }>
                                                {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span>{step.id}</span>}
                                            </div>
                                            <div className={`ml-4 font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step.title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {orderData.status === "shipped" && (
                                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-yellow-800 font-medium">
                                        🚚 ¡Tu pedido ya está en camino!<br />
                                        Cuando estemos cerca del lugar de entrega, nos estaremos comunicando contigo para coordinar la entrega.
                                    </p>
                                </div>
                            )}
                            {orderData.status === "delivered" && (
                                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-yellow-800 font-medium">
                                        ¡Producto entregado! 😊<br />
                                            Gracias por tu compra.
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center text-blue-700">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">
                                        Entrega estimada: {formatDate(orderData.estimatedDelivery)}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                    Recibirás un email con el número de seguimiento cuando tu pedido sea enviado.
                                </p>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Detalles del Pedido
                            </h2>

                            <div className="space-y-4">
                                {orderData.items.map((item: any, index: number) => {
                                    let imageSrc = '';
                                    if (Array.isArray(item.product.images) && item.product.images.length > 0) {
                                      if (typeof item.product.images[0] === 'string') {
                                        imageSrc = item.product.images[0];
                                      } else if (item.product.images[0]?.url) {
                                        imageSrc = item.product.images[0].url;
                                      }
                                    }
                                    if (!imageSrc) imageSrc = '/placeholder.png';
                                    return (
                                        <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={imageSrc}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {item.product.name}
                                                </h4>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Talla: {item.size} • Color: {item.color}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Cantidad: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Dirección de Envío
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-medium text-gray-900">
                                        {orderData.shipping?.firstName} {orderData.shipping?.lastName}
                                    </p>
                                    <p>{orderData.shipping?.address}</p>
                                    <p>
                                        {orderData.shipping?.city}, {orderData.shipping?.state} {orderData.shipping?.zipCode}
                                    </p>
                                    <p>{orderData.shipping?.country}</p>
                                    <div className="pt-2 border-t border-gray-100 mt-3">
                                        <p><strong>Email:</strong> {orderData.user?.email}</p>
                                        <p><strong>Teléfono:</strong> {orderData.user?.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Método de Pago
                                </h3>
                                <div className="text-sm text-gray-600">
                                    <div className="flex items-center justify-between mb-2">
                                        <span>Método:</span>
                                        <span className="font-medium text-gray-900">
                                            {orderData.payment.method === 'card' && 'Tarjeta de Crédito'}
                                            {orderData.payment.method === 'paypal' && 'PayPal'}
                                            {orderData.payment.method === 'izipay' && 'Izipay'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span>Estado:</span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ✓ Pagado
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Total:</span>
                                        <span className="font-bold text-lg text-gray-900">
                                            {formatPrice(orderData.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                ¿Necesitas Ayuda?
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Email</div>
                                        <div className="text-xs text-gray-500">info@polostore.com</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Teléfono</div>
                                        <div className="text-xs text-gray-500">+51 999 999 999</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                    📧 Confirmación Enviada
                                </h4>
                                <p className="text-xs text-blue-700">
                                    Hemos enviado los detalles de tu pedido a {orderData.user?.email}
                                </p>
                            </div>

                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-green-900 mb-2">
                                    🎁 ¡Gracias por tu Compra!
                                </h4>
                                <p className="text-xs text-green-700">
                                    Como agradecimiento, tendrás un 10% de descuento en tu próxima compra.
                                </p>
                            </div>

                            {/* Related Products */}
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                    Te Puede Interesar
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                        <img
                                            src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg"
                                            alt="Producto relacionado"
                                            className="w-10 h-10 rounded object-contain"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-900 truncate">
                                                Polo Premium Lino
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatPrice(54.99)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-xl font-semibold mb-4">¿Qué Sigue?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div className="text-sm font-medium mb-1">1. Confirmación</div>
                            <div className="text-xs opacity-90">Recibirás un email de confirmación</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Package className="h-6 w-6" />
                            </div>
                            <div className="text-sm font-medium mb-1">2. Preparación</div>
                            <div className="text-xs opacity-90">Preparamos tu pedido con cuidado</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div className="text-sm font-medium mb-1">3. Entrega</div>
                            <div className="text-xs opacity-90">Recibe tu pedido en 24-48h</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
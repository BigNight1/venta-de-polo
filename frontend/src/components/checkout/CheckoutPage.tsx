import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  MapPin,
  User,
  Mail,
  Phone,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { formatPrice } from "../../lib/utils";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { IzipayCheckout } from "./IzipayCheckout";
import { useAuth } from '../../context/FirebaseAuthContext';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  orderId?: string;
  identityType?: string;
  identityCode?: string;
  reference?: string;
}

export const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart, setCartOpen } = useStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { user: firebaseUser } = useAuth();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Perú",
  });

  const [izipayToken, setIzipayToken] = useState<{
    formToken: string;
    publicKey: string;
  } | null>(null);
  const [izipayError, setIzipayError] = useState("");

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  // Generar orderId solo una vez al iniciar el checkout
  const [orderId] = useState(() => `ORD-${Date.now()}`);

  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(true);

  useEffect(() => {
    if (currentStep === 2) {
      setIzipayToken(null);
      setIzipayError("");
      // Usar SIEMPRE el mismo orderId
      const body = {
        amount: total,
        ...shippingInfo,
        orderId,
        phoneNumber: shippingInfo.phone || "",
        identityType: shippingInfo.identityType || "DNI",
        identityCode: shippingInfo.identityCode || "",
        reference: shippingInfo.identityCode || "",
        items: cartItems,
        firebaseUser: firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        } : undefined,
      };
      fetch(`${import.meta.env.VITE_API_URL}/payments/izipay/formtoken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.formToken && data.publicKey) {
            setIzipayToken({
              formToken: data.formToken,
              publicKey: data.publicKey,
            });
          } else if (data.token && data.keyRSA) {
            setIzipayToken({ formToken: data.token, publicKey: data.keyRSA });
          } else {
            setIzipayError("No se pudo obtener la pasarela de pago.");
          }
        })
        .catch(() => setIzipayError("No se pudo obtener la pasarela de pago."));
    }
  }, [currentStep, total, shippingInfo, cartItems, firebaseUser]);

  useEffect(() => {
    if (currentStep === 3) {
      setIzipayToken(null);
      setIzipayError("");
      // Usar SIEMPRE el mismo orderId
      const body = {
        orderId,
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phoneNumber: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: "PE",
        zipCode: shippingInfo.zipCode,
        identityType: shippingInfo.identityType || "DNI",
        identityCode: shippingInfo.identityCode || "",
        amount: total,
        currency: "PEN",
        firebaseUser: firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        } : undefined,
      };

      fetch(`${import.meta.env.VITE_API_URL}/payments/izipay/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          if (data.formToken && data.publicKey) {
            setIzipayToken({
              formToken: data.formToken,
              publicKey: data.publicKey,
            });
          } else if (data.token && data.keyRSA) {
            setIzipayToken({ formToken: data.token, publicKey: data.keyRSA });
          } else {
            console.error(
              "[FRONTEND] Error: Datos incompletos del backend:",
              data
            );
            setIzipayToken(null);
            setIzipayError("No se pudo obtener la pasarela de pago.");
          }
        })
        .catch((error) => {
          console.error(
            "[FRONTEND] Error al obtener token del backend:",
            error
          );
          setIzipayToken(null);
          setIzipayError("No se pudo obtener la pasarela de pago.");
        });
    }
  }, [currentStep, total, shippingInfo, firebaseUser]);

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep1 = () => {
    return (
      shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.email &&
      shippingInfo.phone &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const steps = [
    { id: 1, title: "Envío", icon: <Truck className="h-5 w-5" /> },
    { id: 2, title: "Confirmación", icon: <Shield className="h-5 w-5" /> },
    { id: 3, title: "Pago", icon: <CreditCard className="h-5 w-5" /> },
  ];

  // Extrae el contenido del resumen a una función
  const renderOrderSummary = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen del Pedido
      </h3>
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item.product._id + "-" + item.size + "-" + item.color}
            className="flex items-center space-x-3"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={(item.product.images?.[0]?.url || "")}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.product.name}
              </h4>
              <div className="text-xs text-gray-500">
                {item.size} • {item.color} • Qty: {item.quantity}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>
      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="text-gray-900">
            {shipping === 0 ? "Gratis" : formatPrice(shipping)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      {/* Security Notice */}
      <div className="mt-6 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center text-green-700 text-sm">
          <Shield className="h-4 w-4 mr-2" />
          <span>Pago 100% seguro y cifrado</span>
        </div>
      </div>
      {/* Shipping Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center text-blue-700 text-sm">
          <Truck className="h-4 w-4 mr-2" />
          <span>{shipping === 0 ? "Envío gratuito" : "Envío 24-48h"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                navigate("/");
                setCartOpen(true);
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Carrito
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <div className="w-24"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 w-full">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex sm:flex-row items-center justify-between gap-2 sm:gap-0 px-4">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                          currentStep >= step.id
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          currentStep >= step.id
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="block w-16 h-0.5 mx-4 bg-gray-300"
                        style={{
                          background:
                            currentStep > step.id ? "#2563EB" : "#E5E7EB",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Mobile Order Summary - Collapsible */}
            <div className="block sm:hidden bg-white border-b">
              <button
                onClick={() =>
                  setIsOrderSummaryExpanded(!isOrderSummaryExpanded)
                }
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "producto" : "productos"}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
                {isOrderSummaryExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {/* Resumen solo si está expandido */}
              {isOrderSummaryExpanded && (
                <div className="p-4">{renderOrderSummary()}</div>
              )}
            </div>

            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Información de Envío
                </h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleShippingChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleShippingChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleShippingChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="+51 987 654 321"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Calle, número, piso, puerta"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Lima"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Lima"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="15023"
                      />
                    </div>
                  </div>

                  {/* Documento de Identidad */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento *
                      </label>
                      <select
                        name="identityType"
                        value={shippingInfo.identityType || "DNI"}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné de Extranjería</option>
                        <option value="PS">Pasaporte</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento *
                      </label>
                      <input
                        type="text"
                        name="identityCode"
                        value={shippingInfo.identityCode || ""}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Número de documento"
                        required
                      />
                    </div>
                  </div>
                </form>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    disabled={!validateStep1()}
                    className="px-8"
                  >
                    Continuar al Pago
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Confirmación */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Confirmar Pedido
                </h2>

                {/* Shipping Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Dirección de Envío
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </p>
                    <p>{shippingInfo.address}</p>
                    <p>
                      {shippingInfo.city}, {shippingInfo.state}{" "}
                      {shippingInfo.zipCode}
                    </p>
                    <p>{shippingInfo.country}</p>
                    <p>
                      <strong>Documento:</strong> {shippingInfo.identityType}{" "}
                      {shippingInfo.identityCode}
                    </p>
                    <p className="mt-2">
                      <strong>Email:</strong> {shippingInfo.email}
                      <br />
                      <strong>Teléfono:</strong> {shippingInfo.phone}
                    </p>
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={!!shippingInfo.reference}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          reference: e.target.checked ? "aceptado" : "",
                        }))
                      }
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Acepto los{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        términos y condiciones
                      </a>{" "}
                      y la{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        política de privacidad
                      </a>
                    </span>
                  </label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Volver
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!shippingInfo.reference}
                    className="px-8"
                  >
                    Ir a Pagar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Pago (Izipay) */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pago Seguro con Izipay
                </h2>
                {izipayError && (
                  <div className="text-red-500 mb-4">{izipayError}</div>
                )}
                {!izipayToken ? (
                  <div className="text-gray-600">
                    Cargando pasarela de pago...
                  </div>
                ) : (
                  <IzipayCheckout
                    formToken={izipayToken.formToken}
                    publicKey={izipayToken.publicKey}
                    onPaymentSuccess={(paymentResult) => {
                      const orderId = paymentResult.orderId || paymentResult.order_id || paymentResult.id;
                      const orderPayload = {
                        orderId,
                        user: {
                          name: shippingInfo.firstName + ' ' + shippingInfo.lastName,
                          email: shippingInfo.email,
                          phone: shippingInfo.phone,
                        },
                        shipping: {
                          address: shippingInfo.address,
                          city: shippingInfo.city,
                          state: shippingInfo.state,
                          zipCode: shippingInfo.zipCode,
                          country: shippingInfo.country,
                          identityType: shippingInfo.identityType,
                          identityCode: shippingInfo.identityCode,
                        },
                        items: cartItems,
                        total,
                        subtotal,
                        shippingCost: shipping,
                        payment: {
                          method: "izipay",
                          status: "pagado",
                        },
                        status: "pending",
                        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // ejemplo: 3 días después
                        firebaseUser: firebaseUser ? {
                          uid: firebaseUser.uid,
                          email: firebaseUser.email,
                          displayName: firebaseUser.displayName,
                        } : undefined,
                      };
                      fetch(`${import.meta.env.VITE_API_URL}/orders`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderPayload),
                      })
                      .then(res => res.json())
                      .then(() => {
                        clearCart();
                        setCartOpen(false);
                        if (orderId) {
                          navigate(`/order/${orderId}`);
                        } else {
                          alert("No se pudo obtener el número de pedido.");
                        }
                      })
                      .catch(() => {
                        alert('Ocurrió un error al guardar el pedido.');
                      });
                    }}
                    onPaymentError={(err) =>
                      setIzipayError(
                        typeof err === "string"
                          ? err
                          : (err as any)?.message || "Error en el pago"
                      )
                    }
                  />
                )}
              </div>
            )}
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden sm:block lg:col-span-1 w-full">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              {renderOrderSummary()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

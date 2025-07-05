import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Agregar declaración global para window.Izipay
// @ts-ignore
declare global {
  interface Window {
    Izipay?: any;
  }
}

interface IzipayCheckoutProps {
  formToken: string;
  publicKey: string;
  config: any;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export const IzipayCheckout: React.FC<IzipayCheckoutProps> = ({
  formToken,
  publicKey,
  config,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const izipayRef = useRef<HTMLDivElement>(null);

  // Cargar el script oficial de Izipay
  const loadIzipayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.getElementById('izipay-sdk')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.izipay.pe/payments/v1/js/index.js'; // Usa sandbox-checkout.izipay.pe para pruebas
      script.id = 'izipay-sdk';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject('No se pudo cargar el SDK de Izipay');
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let checkoutInstance: any = null;
    let isMounted = true;
    setIsLoading(true);
    setError('');

    // 1. Cargar el script
    loadIzipayScript()
      .then(() => {
        // 2. Pedir token y clave pública al backend
        if (!window.Izipay) throw new Error('SDK de Izipay no disponible');
        // 3. Instanciar el widget con orderId y environment por separado
        checkoutInstance = new window.Izipay({ config });
        // 4. Mostrar el formulario
        checkoutInstance.LoadForm({
          authorization: formToken,
          keyRSA: publicKey,
          callbackResponse: (response: any) => {
            console.log('[FRONTEND] Respuesta widget Izipay:', response);
            if (!isMounted) return;
            if (response.status === 'SUCCESS') {
              onPaymentSuccess(response);
            } else {
              const errorMsg = response.errorMessage || 'Pago rechazado o cancelado';
              setError(errorMsg);
              onPaymentError(errorMsg);
            }
          }
        });
        setIsLoading(false);
      })
      .catch(err => {
        const errorMsg = err.message || 'Error al inicializar el pago';
        console.error('[FRONTEND] Error en IzipayCheckout:', err);
        setError(errorMsg);
        setIsLoading(false);
        onPaymentError(errorMsg);
      });
    return () => {
      isMounted = false;
      // Limpieza si el widget lo permite
    };
  }, [formToken, publicKey, config, onPaymentSuccess, onPaymentError]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pago Seguro con Izipay</h2>
        {isLoading && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
            <span className="text-blue-800">Cargando formulario de pago...</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
        )}
        {/* El widget de Izipay se mostrará automáticamente en un modal o en el body, según el SDK */}
        <div ref={izipayRef} />
      </div>
    </div>
  );
};

// Nota: Debes tener un endpoint en el backend que devuelva { token, keyRSA, config } para la orden. 
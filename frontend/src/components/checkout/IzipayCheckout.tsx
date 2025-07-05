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
      // script.src = 'https://checkout.izipay.pe/payments/v1/js/index.js?mode=embedded&container=iframe-payment'; // Usa Produccion
      script.src = 'https://sandbox-checkout.izipay.pe/payments/v1/js/index.js?mode=embedded&container=iframe-payment'; // URL de TEST
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

    // LOGS PARA DEBUGGING - Verificar datos recibidos
    console.log('[FRONTEND] IzipayCheckout - Datos recibidos:');
    console.log('[FRONTEND] formToken:', formToken);
    console.log('[FRONTEND] publicKey:', publicKey);
    console.log('[FRONTEND] config:', config);
    console.log('[FRONTEND] URL actual:', window.location.href);
    console.log('[FRONTEND] Dominio:', window.location.origin);

    // Validar que el token no esté vacío
    if (!formToken || formToken === '') {
      const errorMsg = 'Error: formToken está vacío o no definido';
      console.error('[FRONTEND]', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      onPaymentError(errorMsg);
      return;
    }

    // Validar que el token no sea el fake token
    if (formToken.includes('FAKE_TOKEN')) {
      const errorMsg = 'Error: Se recibió un token fake del backend';
      console.error('[FRONTEND]', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      onPaymentError(errorMsg);
      return;
    }

    // 1. Cargar el script
    loadIzipayScript()
      .then(() => {
        console.log('[FRONTEND] Script de Izipay cargado exitosamente');
        
        // 2. Verificar que el SDK esté disponible
        if (!window.Izipay) {
          throw new Error('SDK de Izipay no disponible después de cargar el script');
        }
        
        console.log('[FRONTEND] SDK de Izipay disponible:', !!window.Izipay);
        
        // 3. Instanciar el widget con orderId y environment por separado
        console.log('[FRONTEND] Inicializando widget con config:', config);
        checkoutInstance = new window.Izipay({ config });
        
        // 4. Mostrar el formulario
        console.log('[FRONTEND] Cargando formulario con token:', formToken);
        console.log('[FRONTEND] Cargando formulario con keyRSA:', publicKey);
        
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
              console.error('[FRONTEND] Error en pago:', errorMsg);
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
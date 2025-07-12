import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import KRGlue from '@lyracom/embedded-form-glue';
import axios from 'axios';

interface IzipayCheckoutProps {
  formToken: string;
  publicKey: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

// Agregar declaración para evitar errores de TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { KR?: any } }

export const IzipayCheckout: React.FC<IzipayCheckoutProps> = ({
  formToken,
  publicKey,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const izipayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    // Limpiar el formulario anterior si existe
    const removeForms = async () => {
      if (window.KR && window.KR.removeForms) {
        try { await window.KR.removeForms(); } catch {}
      }
      // Limpia el contenedor del widget
      const smartFormDiv = document.querySelector('.kr-smart-form');
      if (smartFormDiv) {
        smartFormDiv.innerHTML = '';
      }
    };
    removeForms();

    if (!formToken || formToken === '') {
      const errorMsg = 'Error: formToken está vacío o no definido';
      console.error('[FRONTEND][KRGlue]', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      onPaymentError(errorMsg);
      return;
    }

    // Endpoint de MiCuentaWeb/Krypton
    const endpoint = 'https://static.micuentaweb.pe';

    KRGlue.loadLibrary(endpoint, publicKey).then(({ KR }) => {
      if (!isMounted) return;
      KR.setFormConfig({
        formToken: formToken,
        'kr-language': 'es-ES',
      });
      KR.renderElements('.kr-smart-form').then(({ KR, result }) => {
        if (result && result.formId) {
          KR.showForm(result.formId);
        }
      });
      KR.onSubmit(async paymentData => {
        if (!isMounted) return false;
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/payments/izipay/validate`, {
            'kr-answer': paymentData.clientAnswer,
            'kr-hash': paymentData.hash,
          });
          if (res.data && res.data.success) {
            onPaymentSuccess(res.data); // Usar la respuesta del backend (con orderId)
          } else {
            setError('Pago rechazado o validación fallida');
            onPaymentError('Pago rechazado o validación fallida');
          }
        } catch (err) {
          setError('Error al validar el pago');
          onPaymentError('Error al validar el pago');
        }
        return false;
      });
      setIsLoading(false);
    }).catch(err => {
      const errorMsg = err.message || 'Error al inicializar el pago';
      console.error('[FRONTEND][KRGlue] Error:', err);
      setError(errorMsg);
      setIsLoading(false);
      onPaymentError(errorMsg);
    });
    return () => {
      isMounted = false;
      // Limpiar formularios al desmontar
      if (window.KR && window.KR.removeForms) {
        try { window.KR.removeForms(); } catch {}
      }
    };
  }, [formToken, publicKey, onPaymentSuccess, onPaymentError]);

  return (
    <div className="">
      <div className="max-w-2xl w-full h-full bg-white rounded-xl shadow-md p-10 flex justify-center items-center" >
        {isLoading && (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <span className="text-blue-800 text-lg">Cargando formulario de pago...</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-base">{error}</div>
        )}
        {/* El widget de Izipay se mostrará aquí */}
        <div id="micuentawebstd_rest_wrapper" ref={izipayRef} className="mb-4" />
        <div className="kr-smart-form" />
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const WhatsAppTest: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleTest = async () => {
    if (!phone.trim()) {
      setResult({ error: 'Por favor ingresa un número de teléfono' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/test-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: phone.trim(),
          message: message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Mensaje enviado correctamente' });
        setPhone('');
        setMessage('');
      } else {
        setResult({ error: data.error || 'Error al enviar el mensaje' });
      }
    } catch (error) {
      setResult({ error: 'Error de conexión' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="h-6 w-6 text-green-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Prueba de WhatsApp</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Teléfono *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 999888777 o +51 999 888 777"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formato: 999888777, +51 999 888 777, o (999) 888-777
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje (Opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deja vacío para usar el mensaje de prueba por defecto"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleTest}
          disabled={isLoading || !phone.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensaje de Prueba
            </>
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {result.success ? (
                <MessageCircle className="h-5 w-5 mr-2" />
              ) : (
                <MessageCircle className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {result.success ? 'Éxito' : 'Error'}
              </span>
            </div>
            <p className="mt-1 text-sm">
              {result.message || result.error}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Este endpoint solo funciona en desarrollo</li>
            <li>• Asegúrate de configurar las variables de WhatsApp</li>
            <li>• El número debe tener WhatsApp activo</li>
            <li>• Revisa la consola del servidor para más detalles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 
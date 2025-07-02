import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useStore();

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="p-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Función de autenticación deshabilitada</h2>
            <p className="text-gray-600 text-center mb-4">El login y registro han sido deshabilitados temporalmente.</p>
            <Button onClick={handleClose}>Cerrar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
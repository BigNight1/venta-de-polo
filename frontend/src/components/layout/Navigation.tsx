import React from 'react';
import { useStore } from '../../store/useStore';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user, setAuthModalOpen } = useStore();

  const navigationItems = [
    { id: 'home', label: 'Inicio', path: '/' },
    { id: 'about', label: 'Acerca de', path: '/about' },
    { id: 'contact', label: 'Contacto', path: '/contact' },
  ];

  const userItems = user ? [
    { id: 'orders', label: 'Mis Pedidos', path: '/orders' },
  ] : [];

  const allItems = [...navigationItems, ...userItems];

  return (
    <nav className="hidden md:flex space-x-8">
      {allItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onPageChange(item.id)}
          className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            currentPage === item.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {item.label}
        </button>
      ))}
      
      {!user && (
        <button
          onClick={() => setAuthModalOpen(true)}
          className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
        >
          Iniciar Sesión
        </button>
      )}
    </nav>
  );
};
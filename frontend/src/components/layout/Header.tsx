import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCombobox } from 'downshift';
import { useProducts } from '../../context/ProductContext';
import { getImageUrl } from '../../lib/getImageUrl';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    setCartOpen,
    setAuthModalOpen,
    setFilters,
    getCartItemsCount,
  } = useStore();
  const { products } = useProducts();

  const navigationItems = [
    { id: '/', label: 'Inicio' },
  ];

  const categories = [
    { id: 'hombre', label: 'Hombre' },
    { id: 'mujer', label: 'Mujer' },
    { id: 'ninos', label: 'Niños' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleCategoryClick = (category: string) => {
    setFilters({ category });
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Downshift autocomplete
  const items = products.filter(p =>
    searchQuery.length > 0 && p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    selectItem,
  } = useCombobox({
    items,
    inputValue: searchQuery,
    onInputValueChange: ({ inputValue }) => setSearchQuery(inputValue || ''),
    itemToString: item => (item ? item.name : ''),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        navigate(`/product/${selectedItem._id}`);
        setSearchQuery('');
      }
    },
  });
  console.log(products)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              PoloStore
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 mr-8">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.id}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Categories (only show on home page) */}
          {location.pathname === '/' && (
            <nav className="hidden lg:flex space-x-6 mr-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {category.label}
                </button>
              ))}
            </nav>
          )}

          {/* Search Bar */}
          <div className="hidden sm:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...getInputProps({
                  placeholder: 'Buscar polos...',
                  className: 'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
                })}
              />
              <ul
                {...getMenuProps()}
                className={`absolute z-10 bg-white border w-full mt-1 rounded shadow ${isOpen && items.length > 0 ? '' : 'hidden'}`}
              >
                {isOpen &&
                  items.map((item, index) => (
                    <li
                      key={item._id}
                      {...getItemProps({ item, index })}
                      className={`flex items-center px-3 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-blue-100' : ''}`}
                    >
                      <img src={getImageUrl(item.images[0])} alt={item.name} className="w-10 h-10 object-cover rounded mr-3" />
                      <span>{item.name}</span>
                    </li>
                  ))}
              </ul>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getCartItemsCount()}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : setAuthModalOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <User className="h-6 w-6" />
                {user && (
                  <span className="hidden md:block text-sm font-medium">
                    {user.fullName.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              {user && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors block"
                  >
                    Mis Pedidos
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar polos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.id}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* Mobile Categories */}
          {location.pathname === '/' && (
            <div className="px-2 pt-2 pb-3 space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
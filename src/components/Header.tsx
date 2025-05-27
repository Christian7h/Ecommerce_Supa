import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const cartStore = useCartStore();
  const { user, logout } = useAuthStore();
  
  const itemCount = cartStore.totalItems();
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCategoryMenuOpen(false);
  }, [location]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-sm py-4'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight">ADIDAS</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-900 hover:text-accent transition-colors"
            >
              Home
            </Link>
            <div className="relative group">
              <button 
                className="flex items-center text-gray-900 hover:text-accent transition-colors"
                onClick={toggleCategoryMenu}
              >
                Categories <ChevronDown size={16} className="ml-1" />
              </button>
              <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                isCategoryMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}>
                <div className="py-1">
                  <Link to="/products?category=men" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Men
                  </Link>
                  <Link to="/products?category=women" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Women
                  </Link>
                  <Link to="/products?category=kids" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Kids
                  </Link>
                  <Link to="/products?category=sports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sports
                  </Link>
                </div>
              </div>
            </div>
            <Link 
              to="/products" 
              className="text-gray-900 hover:text-accent transition-colors"
            >
              Products
            </Link>
          </nav>
          
          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-900 hover:text-accent transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            <Link 
              to="/cart" 
              className="text-gray-900 hover:text-accent transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xxs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="relative group">
                <button className="text-gray-900 hover:text-accent transition-colors flex items-center">
                  <User size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  <div className="py-1">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mis Órdenes
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-900 hover:text-accent transition-colors"
                aria-label="Login"
              >
                <User size={20} />
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-900 hover:text-accent transition-colors"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out transform ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      } md:hidden`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-xl font-bold">ADIDAS</span>
            <button onClick={toggleMenu} aria-label="Close Menu">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-lg font-medium py-2 border-b border-gray-100"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <button 
                className="text-lg font-medium py-2 border-b border-gray-100 flex justify-between items-center"
                onClick={toggleCategoryMenu}
              >
                Categories
                <ChevronDown size={20} className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoryMenuOpen && (
                <div className="pl-4 space-y-2">
                  <Link 
                    to="/products?category=men" 
                    className="block py-2"
                    onClick={toggleMenu}
                  >
                    Men
                  </Link>
                  <Link 
                    to="/products?category=women" 
                    className="block py-2"
                    onClick={toggleMenu}
                  >
                    Women
                  </Link>
                  <Link 
                    to="/products?category=kids" 
                    className="block py-2"
                    onClick={toggleMenu}
                  >
                    Kids
                  </Link>
                  <Link 
                    to="/products?category=sports" 
                    className="block py-2"
                    onClick={toggleMenu}
                  >
                    Sports
                  </Link>
                </div>
              )}
              
              <Link 
                to="/products" 
                className="text-lg font-medium py-2 border-b border-gray-100"
                onClick={toggleMenu}
              >
                Products
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-lg font-medium py-2 border-b border-gray-100"
                    onClick={toggleMenu}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/orders" 
                    className="text-lg font-medium py-2 border-b border-gray-100"
                    onClick={toggleMenu}
                  >
                    Mis Órdenes
                  </Link>
                  <button 
                    className="text-lg font-medium py-2 border-b border-gray-100 flex items-center"
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                  >
                    <LogOut size={20} className="mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-lg font-medium py-2 border-b border-gray-100"
                  onClick={toggleMenu}
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
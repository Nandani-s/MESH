import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X,
  Truck,
  ChevronRight,
  User
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Sale', path: '/sale' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center text-sm font-medium">
            <Truck className="w-4 h-4 mr-2" />
            <span>Free Shipping on Orders Over $50 | Easy 30-Day Returns</span>
            <ChevronRight className="w-4 h-4 ml-2 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-surface-light/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                MESH
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-text-secondary hover:text-primary-500 hover:bg-background-muted'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search */}
              <div className="relative">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-text-secondary hover:text-primary-500 transition-colors rounded-lg hover:bg-background-muted"
                >
                  <Search className="w-5 h-5" />
                </button>
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-surface-light rounded-xl shadow-2xl border border-border p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link 
                to="/login"
                className="p-2 text-text-secondary hover:text-primary-500 transition-colors rounded-lg hover:bg-background-muted relative"
              >
                <User  className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link 
                to="/wishlist"
                className="p-2 text-text-secondary hover:text-primary-500 transition-colors rounded-lg hover:bg-background-muted relative"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  3
                </span>
              </Link>

              {/* Cart */}
              <Link 
                to="/cart"
                className="p-2 text-text-secondary hover:text-primary-500 transition-colors rounded-lg hover:bg-background-muted relative"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  2
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2 text-text-secondary hover:text-primary-500 transition-colors rounded-lg hover:bg-background-muted"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border-light py-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      location.pathname === link.path
                        ? 'text-primary-500 bg-primary-50'
                        : 'text-text-secondary hover:text-primary-500 hover:bg-background-muted'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              {/* Mobile Search */}
              <div className="mt-4 px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
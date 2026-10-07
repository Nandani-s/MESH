import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Truck,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import logo from '../assets/logo.png';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Categories', path: '/categories' },
  { name: 'New Arrivals', path: '/new-arrivals' },
  { name: 'Deals', path: '/sale' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Badge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[11px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-semibold">
      {count > 9 ? '9+' : count}
    </span>
  ) : null;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    closeAll();
    try {
      await logout();
    } finally {
      navigate('/');
    }
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const announcement = settings.freeShippingThreshold > 0
    ? `Free Shipping on Orders Over ${formatCurrency(settings.freeShippingThreshold, settings.currency)} · Easy 30-Day Returns`
    : 'Free Shipping Across Nepal · Easy 30-Day Returns';

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-text-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-center text-center text-xs sm:text-sm font-medium tracking-wide">
            <Truck className="w-4 h-4 mr-2 shrink-0 text-accent-400" />
            <span>{announcement}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b transition-shadow duration-300 ${
          scrolled ? 'shadow-lg shadow-text-primary/5' : 'border-border-light'
        }`}
      >
        {/* Row 1 — centered logo with search left, actions right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 lg:h-20 gap-3">
            {/* Left: mobile menu + inline search */}
            <div className="flex items-center gap-2 z-10 min-w-0">
              <button
                type="button"
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50 shrink-0"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <form
                onSubmit={handleSearch}
                aria-label="Product search"
                className="hidden sm:flex items-center gap-2 w-40 lg:w-64 xl:w-80 rounded-full border border-border bg-background-muted/70 px-3.5 py-2 focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20 focus-within:bg-surface transition-all"
              >
                <Search className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dresses, tops..."
                  className="w-full min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </form>
            </div>

            {/* Center: logo */}
            <Link
              to="/"
              onClick={closeAll}
              aria-label="MESH home"
              className="absolute left-1/2 -translate-x-1/2 flex items-center"
            >
              <img
                src={logo}
                alt="MESH — Women's Fashion"
                className="h-8 sm:h-10 lg:h-14 w-auto object-contain"
              />
            </Link>

            {/* Right: account, wishlist, cart */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 z-10">
              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    aria-label="Account menu"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1 p-2 text-text-secondary hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
                  >
                    <User className="w-5 h-5" />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-surface-light rounded-xl shadow-2xl border border-border-light py-2 z-20">
                        <div className="px-4 py-3 border-b border-border-light">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-text-muted truncate">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-muted transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            My Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-muted transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            Wishlist
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-muted transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-border-light pt-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-danger-500 hover:bg-danger-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Sign in"
                  className="hidden sm:flex p-2 text-text-secondary hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="p-2 text-text-secondary hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50 relative"
              >
                <Heart className="w-5 h-5" />
                <Badge count={wishlistCount} />
              </Link>

              <Link
                to="/cart"
                aria-label="Cart"
                className="p-2 text-text-secondary hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50 relative"
              >
                <ShoppingBag className="w-5 h-5" />
                <Badge count={cartCount} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile inline search */}
        <div className="sm:hidden px-4 pb-2.5">
          <form
            onSubmit={handleSearch}
            aria-label="Product search"
            className="flex items-center gap-2 rounded-full border border-border bg-background-muted/70 px-3.5 py-2 focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20 focus-within:bg-surface transition-all"
          >
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </form>
        </div>

        {/* Row 2 — full-width nav, centered */}
        <nav className="hidden lg:block border-t border-border-light bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-center gap-1 xl:gap-2 -mt-px">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={closeAll}
                    className={`relative flex items-center px-3.5 xl:px-4 py-3.5 transition-all duration-200 text-[13px] font-semibold uppercase tracking-[0.12em] after:absolute after:left-3.5 after:right-3.5 xl:after:left-4 xl:after:right-4 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-accent-500 after:transition-transform ${
                      isActive(link.path)
                        ? 'text-primary-600 after:scale-x-100'
                        : 'text-text-secondary hover:text-primary-600 after:scale-x-0 hover:after:scale-x-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] ${isMenuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 bg-text-primary/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-border-light shrink-0">
            <img src={logo} alt="MESH" className="h-9 w-auto object-contain" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full text-text-secondary hover:bg-background-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-border-light shrink-0">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </form>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeAll}
                  className={`block px-4 py-3 rounded-xl transition-colors text-sm font-semibold ${
                    isActive(link.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-text-secondary hover:text-primary-600 hover:bg-background-muted'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border-light space-y-1">
              <Link
                onClick={closeAll}
                to="/cart"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-muted transition-colors"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" /> Cart
                </span>
                {cartCount > 0 && (
                  <span className="bg-primary-500 text-white text-[11px] rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                onClick={closeAll}
                to="/wishlist"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-muted transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-4 h-4" /> Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="bg-primary-500 text-white text-[11px] rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                onClick={closeAll}
                to="/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-muted transition-colors"
              >
                <Package className="w-4 h-4" /> My Orders
              </Link>
            </div>
          </nav>

          <div className="px-5 py-4 border-t border-border-light shrink-0 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="text-sm">
                  <p className="font-semibold text-text-primary truncate">{user?.name}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <div className="flex gap-2">
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex-1 text-center border border-border-strong hover:border-primary-500 hover:text-primary-600 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 border border-danger-200 text-danger-500 hover:bg-danger-50 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 text-center border border-border-strong hover:border-primary-500 hover:text-primary-600 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Header;

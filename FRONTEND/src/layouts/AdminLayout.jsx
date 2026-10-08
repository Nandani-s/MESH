import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { apiGet } from '../api/client';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Eye,
  BarChart3,
  TrendingUp,
  Home
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [counts, setCounts] = useState({ products: null, categories: null, users: null });

  useEffect(() => {
    apiGet('/dashboard')
      .then((res) => {
        const { products, categories, users } = res.data.counts;
        setCounts({ products, categories, users });
      })
      .catch(() => {}); // silently fail — badges just stay blank
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(
    location.pathname.startsWith('/admin/products')
  );
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(
    location.pathname.startsWith('/admin/categories')
  );

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: 'Main Menu',
      items: [
        { 
          name: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/admin',
          badge: null
        },
      ]
    },
    {
      title: 'Store Management',
      items: [
        { 
          name: 'Products', 
          icon: Package, 
          path: '/admin/products',
          badge: counts.products !== null ? String(counts.products) : null,
          children: [
            { name: 'All Products', path: '/admin/products' },
            { name: 'Add Product', path: '/admin/products/new' },
          ]
        },
        { 
          name: 'Categories', 
          icon: Tags, 
          path: '/admin/categories',
          badge: counts.categories !== null ? String(counts.categories) : null,
          children: [
            { name: 'All Categories', path: '/admin/categories' },
            { name: 'Add Category', path: '/admin/categories/new' },
          ]
        },
        { 
          name: 'Orders', 
          icon: ShoppingCart, 
          path: '/admin/orders',
          badge: null
        },
      ]
    },
    {
      title: 'Customer',
      items: [
        { 
          name: 'Customers', 
          icon: Users, 
          path: '/admin/users',
          badge: counts.users !== null ? String(counts.users) : null
        },
       
      ]
    },
	 {
      title: 'Reports',
      items: [
        { 
          name: 'Reports', 
          icon: BarChart3, 
          path: '/admin/reports',
          badge: null
        },
        { 
          name: 'Analytics', 
          icon: TrendingUp, 
          path: '/admin/analytics',
          badge: 'New'
        },
      ]
    },
    {
      title: 'Settings',
      items: [
        { 
          name: 'Settings', 
          icon: Settings, 
          path: '/admin/settings',
          badge: null
        },
      ]
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  // "JD" from "John Doe"; falls back if name is missing/blank
  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'AD';
  };

  return (
    <div className="flex h-screen bg-background-light">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-30 h-full bg-surface-dark text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-border-dark">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <h1 className="font-bold text-lg leading-tight text-white">{settings.storeName || 'Admin'}</h1>
                  <p className="text-xs text-primary-200">Admin Panel</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                {isSidebarOpen && (
                  <h3 className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const hasSubmenu = Boolean(item.children);
                    const isSubmenuOpen = item.name === 'Products'
                      ? isProductsMenuOpen
                      : isCategoriesMenuOpen;
                    
                    return (
                      <li key={index}>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            {hasSubmenu && isSidebarOpen ? (
                              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-primary-200">
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium text-sm">{item.name}</span>
                                {item.badge && (
                                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-primary-200">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Link
                                to={item.path}
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    setIsSidebarOpen(false);
                                  }
                                }}
                                className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                  active
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                                }`}
                                title={!isSidebarOpen ? item.name : ''}
                              >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {isSidebarOpen && (
                                  <>
                                    <span className="font-medium text-sm">{item.name}</span>
                                    {item.badge && (
                                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                                        active
                                          ? 'bg-white/20 text-white'
                                          : 'bg-white/10 text-primary-200'
                                      }`}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </>
                                )}
                                {!isSidebarOpen && item.badge && (
                                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {item.badge.length > 2 ? '!' : item.badge}
                                  </span>
                                )}
                              </Link>
                            )}
                            {hasSubmenu && isSidebarOpen && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.name === 'Products') {
                                    setIsProductsMenuOpen((open) => !open);
                                  } else {
                                    setIsCategoriesMenuOpen((open) => !open);
                                  }
                                }}
                                aria-label={`${isSubmenuOpen ? 'Collapse' : 'Expand'} ${item.name.toLowerCase()} menu`}
                                aria-expanded={isSubmenuOpen}
                                className="rounded-lg p-2 text-primary-200 transition hover:bg-white/10 hover:text-white"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          {hasSubmenu && isSidebarOpen && isSubmenuOpen && (
                            <ul className="ml-5 space-y-1 border-l border-white/10 pl-3">
                              {item.children.map((child) => {
                                const childActive = location.pathname === child.path;
                                return (
                                  <li key={child.path}>
                                    <Link
                                      to={child.path}
                                      onClick={() => {
                                        if (window.innerWidth < 1024) {
                                          setIsSidebarOpen(false);
                                        }
                                      }}
                                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                                        childActive
                                          ? 'bg-white/10 font-medium text-white'
                                          : 'text-primary-200 hover:bg-white/10 hover:text-white'
                                      }`}
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border-dark">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-200 hover:bg-white/10 hover:text-white transition-all duration-200`}
              title={!isSidebarOpen ? 'View Store' : ''}
            >
              <Home className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-medium">View Store</span>}
            </a>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger-400 hover:bg-danger-500/20 hover:text-danger-300 transition-all duration-200 mt-1`}
              title={!isSidebarOpen ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-surface-light border-b border-border-light shadow-sm">
          <div className="px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-background-muted rounded-lg transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5 text-text-secondary" /> : <Menu className="w-5 h-5 text-text-secondary" />}
              </button>

              <div className="flex items-center gap-2 lg:gap-3">
                {/* Notifications */}
                {/* <button className="p-2 hover:bg-background-muted rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-text-secondary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                </button> */}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-2 hover:bg-background-muted rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {getInitials(user?.name)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-text-primary">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-text-muted">Administrator</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-text-muted hidden lg:block" />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface-light rounded-xl shadow-2xl border border-border-light py-2 z-20">
                        <div className="px-4 py-3 border-b border-border-light">
                          <p className="text-sm font-medium text-text-primary">{user?.name || 'Admin'}</p>
                          <p className="text-xs text-text-muted">{user?.email || ''}</p>
                        </div>
                        <div className="py-2">
                          <Link 
                            to="/admin/settings" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-muted transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Profile Settings
                          </Link>
                          <a 
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-muted transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Eye className="w-4 h-4" />
                            View Store
                          </a>
                        </div>
                        <div className="border-t border-border-light pt-2">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              handleLogout();
                            }}
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
              </div>
            </div>

            {/* Mobile Search */}
            <div className="mt-3 md:hidden">
              <div className="flex items-center gap-2 bg-background-muted rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Using Outlet for nested routes */}
        <main className="flex-1 overflow-y-auto bg-background-light">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
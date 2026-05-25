import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Users,
  ShoppingCart,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  DollarSign,
  Box,
  Star,
  Image as ImageIcon,
  Mail,
  Moon,
  Sun,
  Home
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
        { 
          name: 'Analytics', 
          icon: BarChart3, 
          path: '/admin/analytics',
          badge: 'New'
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
          badge: '124'
        },
        { 
          name: 'Categories', 
          icon: Tags, 
          path: '/admin/categories',
          badge: '8'
        },
        { 
          name: 'Orders', 
          icon: ShoppingCart, 
          path: '/admin/orders',
          badge: '15'
        },
      ]
    },
    {
      title: 'Customer',
      items: [
        { 
          name: 'Customers', 
          icon: Users, 
          path: '/admin/customers',
          badge: '50K+'
        },
        { 
          name: 'Wishlist', 
          icon: Heart, 
          path: '/wishlist',
          badge: null
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

  const quickStats = [
    { label: 'Revenue', value: '$45,231', icon: DollarSign, change: '+12.5%', positive: true },
    { label: 'Orders', value: '356', icon: ShoppingBag, change: '+8.2%', positive: true },
    { label: 'Products', value: '124', icon: Box, change: '-2.4%', positive: false },
    { label: 'Customers', value: '5,423', icon: Users, change: '+18.7%', positive: true },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background-light">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
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
                  <h1 className="font-bold text-lg leading-tight text-white">Femme</h1>
                  <p className="text-xs text-text-muted">Admin Panel</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                {isSidebarOpen && (
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <li key={index}>
                        <Link
                          to={item.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                            active 
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                              : 'text-text-muted hover:bg-white/10 hover:text-white'
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
                                    : 'bg-white/10 text-text-muted'
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
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border-dark">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-white/10 hover:text-white transition-all duration-200`}
              title={!isSidebarOpen ? 'View Store' : ''}
            >
              <Home className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-medium">View Store</span>}
            </Link>
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
              <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-background-muted rounded-lg transition-colors"
                >
                  {isSidebarOpen ? <X className="w-5 h-5 text-text-secondary" /> : <Menu className="w-5 h-5 text-text-secondary" />}
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-2 bg-background-muted rounded-xl px-4 py-2 flex-1 max-w-md">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search orders, products, customers..."
                    className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                {/* Quick Actions */}
                <Link
                  to="/admin/products/add"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>

                {/* Notifications */}
                <button className="p-2 hover:bg-background-muted rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-text-secondary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-2 hover:bg-background-muted rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      SA
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-text-primary">Sarah Admin</p>
                      <p className="text-xs text-text-muted">Administrator</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-text-muted hidden lg:block" />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface-light rounded-xl shadow-2xl border border-border-light py-2 z-20">
                        <div className="px-4 py-3 border-b border-border-light">
                          <p className="text-sm font-medium text-text-primary">Sarah Anderson</p>
                          <p className="text-xs text-text-muted">sarah@femmefashion.com</p>
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
                          <Link 
                            to="/" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-muted transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Eye className="w-4 h-4" />
                            View Store
                          </Link>
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

        {/* Quick Stats Bar */}
        <div className="bg-surface-light border-b border-border-light px-4 lg:px-6 py-4 hidden lg:block">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted font-medium">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                      <span className={`text-xs font-medium ${stat.positive ? 'text-success-500' : 'text-danger-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background-light">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
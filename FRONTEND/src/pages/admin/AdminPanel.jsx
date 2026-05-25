import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Image,
  Mail,
  Moon,
  Sun
} from 'lucide-react';

// Import Admin Page Components
import AdminDashboard from './Dashboard';
import AdminProducts from './Products';
import AdminCategories from './Categories';
import AdminOrders from './Orders';
import AdminCustomers from './Customers';
import AdminAnalytics from './Analytics';
import AdminSettings from './Settings';
import AdminAddProduct from './AddProduct';
import AdminEditProduct from './EditProduct';

const AdminPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="flex h-screen bg-background-light">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-border-light transition-all duration-300 flex flex-col fixed lg:relative z-30 h-full`}>
        {/* Logo */}
        <div className="p-5 border-b border-border-light">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-text-primary text-lg leading-tight">Femme</h1>
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
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                          isActive 
                            ? 'bg-primary-50 text-primary-600' 
                            : 'text-text-secondary hover:bg-background-muted hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <>
                            <span className="font-medium text-sm">{item.name}</span>
                            {item.badge && (
                              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                                isActive 
                                  ? 'bg-primary-100 text-primary-600' 
                                  : 'bg-background-muted text-text-muted'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {!isSidebarOpen && item.badge && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {item.badge}
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
        <div className="p-3 border-t border-border-light">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-background-muted hover:text-text-primary transition-all duration-200`}
          >
            <Eye className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-medium">View Store</span>}
          </Link>
          <button
            onClick={() => navigate('/login')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger-500 hover:bg-danger-50 transition-all duration-200 mt-1`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-border-light px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-background-muted rounded-lg transition-colors lg:hidden"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-background-muted rounded-xl px-4 py-2 min-w-[300px]">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search orders, products, customers..."
                  className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-background-muted rounded-lg transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="p-2 hover:bg-background-muted rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-background-muted rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    SA
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-text-primary">Sarah Admin</p>
                    <p className="text-xs text-text-muted">Administrator</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted hidden md:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-border-light py-2">
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-text-secondary hover:bg-background-muted">
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => navigate('/login')}
                      className="block w-full text-left px-4 py-2 text-sm text-danger-500 hover:bg-danger-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Quick Stats Bar */}
        <div className="bg-white border-b border-border-light px-6 py-4">
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
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/products/add" element={<AdminAddProduct />} />
            <Route path="/products/edit/:id" element={<AdminEditProduct />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/customers" element={<AdminCustomers />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
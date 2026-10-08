// pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Package, Users, Heart,
  TrendingUp, AlertTriangle, Loader2,
  AlertCircle, ImageOff, Tag
} from 'lucide-react';
import { apiGet } from '../../api/client';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';

const NOW = Date.now();

const AdminDashboard = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load dashboard.'))
      .finally(() => setIsLoading(false));
  }, []);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '??';
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((NOW - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</p>
        </div>
        <Link to="/admin/products"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Manage Products
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger-500" />
          <p className="text-danger-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Products', value: data.counts.products, icon: Package, gradient: 'from-primary-500 to-primary-700', link: '/admin/products' },
              { title: 'Total Users', value: data.counts.users, icon: Users, gradient: 'from-accent-500 to-accent-700', link: '/admin/users' },
              { title: 'Categories', value: data.counts.categories, icon: Tag, gradient: 'from-primary-300 to-primary-500', link: '/admin/categories' },
              { title: 'Wishlist Items', value: data.counts.wishlistItems, icon: Heart, gradient: 'from-primary-400 to-primary-600', link: '/admin/wishlist' },
            ].map(({ title, value, icon: Icon, gradient, link }) => (
              <Link key={title} to={link}
                className="bg-surface-light rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border-light p-6 block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted mb-1">{title}</p>
                    <p className="text-2xl font-bold text-text-primary">{value.toLocaleString()}</p>
                    {title === 'Total Users' && (
                      <p className="text-xs text-success-700 mt-1">+{data.counts.newUsersThisMonth} this month</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Revenue/Orders placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Total Revenue', icon: ShoppingCart, color: 'from-success-500 to-success-700' },
              { title: 'Total Orders', icon: ShoppingCart, color: 'from-primary-500 to-primary-600' },
            ].map(({ title, icon: Icon, color }) => (
              <div key={title} className="bg-surface-light rounded-xl shadow-sm border border-border-light p-6 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-sm text-text-muted mb-1">{title}</p>
                  <p className="text-2xl font-bold text-text-muted">—</p>
                  <p className="text-xs text-text-muted mt-1">Available after order system is built</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Wishlisted Products */}
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="p-6 border-b border-border-light flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Most Wishlisted Products</h2>
                <Link to="/admin/wishlist" className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all →</Link>
              </div>
              {data.topWishlisted.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  <Heart className="w-10 h-10 mx-auto mb-3 text-border" />
                  <p>No wishlist data yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border-light">
                  {data.topWishlisted.map((item, index) => (
                    <div key={item.product._id} className="flex items-center gap-4 p-4 hover:bg-background-muted transition">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        index === 0 ? 'bg-accent-100 text-accent-800' :
                        index === 1 ? 'bg-secondary-100 text-secondary-700' :
                        index === 2 ? 'bg-primary-100 text-primary-700' : 'bg-background-muted text-text-muted'
                      }`}>{index + 1}</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-muted flex items-center justify-center flex-shrink-0">
                        {item.product.image
                          ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          : <ImageOff className="w-4 h-4 text-text-muted" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{item.product.name}</p>
                        <p className="text-xs text-text-muted">{formatCurrency(item.product.price, settings.currency)} · Stock: {item.product.stock}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Heart className="w-4 h-4 text-accent-500 fill-accent-500" />
                        <span className="text-sm font-semibold text-text-primary">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Users */}
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="p-6 border-b border-border-light flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Recent Users</h2>
                <Link to="/admin/users" className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all →</Link>
              </div>
              {data.recentUsers.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  <Users className="w-10 h-10 mx-auto mb-3 text-border" />
                  <p>No users yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border-light">
                  {data.recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center gap-3 p-4 hover:bg-background-muted transition">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{u.name}</p>
                        <p className="text-xs text-text-muted truncate">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-accent-100 text-accent-800' : 'bg-primary-100 text-primary-700'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                        <span className="text-xs text-text-muted">{timeAgo(u.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          {data.lowStockProducts.length > 0 && (
            <div className="bg-surface-light rounded-xl shadow-sm border border-warning-200">
              <div className="p-6 border-b border-warning-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <h2 className="text-lg font-semibold text-text-primary">Low Stock Alert</h2>
                <span className="ml-auto text-xs bg-warning-100 text-warning-800 px-2 py-1 rounded-full font-medium">
                  {data.lowStockProducts.length} product{data.lowStockProducts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-border-light">
                {data.lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 p-4 hover:bg-background-muted transition">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-muted flex items-center justify-center flex-shrink-0">
                      {product.image
                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        : <ImageOff className="w-4 h-4 text-text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{product.name}</p>
                      <p className="text-xs text-text-muted">{product.availability}</p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                      product.stock === 0 ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-800'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                    <Link to="/admin/products"
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium flex-shrink-0">
                      Update →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

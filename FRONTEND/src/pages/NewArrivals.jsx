import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, Clock, Sparkles, ArrowRight,
  Zap, Loader2, Package, AlertCircle
} from 'lucide-react';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

const getDaysAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  return diff;
};

const getBadge = (daysAgo) => {
  if (daysAgo <= 1) return { label: 'Just In', color: 'bg-success-500' };
  if (daysAgo <= 3) return { label: 'New', color: 'bg-accent-500' };
  if (daysAgo <= 7) return { label: 'Recent', color: 'bg-primary-500' };
  return null;
};

const NewArrivals = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([prodRes, catRes]) => {
        const sorted = (prodRes.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sorted);
        setCategories((catRes.data || []).filter(c => c.status === 'active'));
      })
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleHeartClick = async (e, product) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    await toggleWishlist(product);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const tabs = [
    { id: 'all', label: 'All New Arrivals' },
    ...categories.map(c => ({ id: c.name.toLowerCase(), label: c.name })),
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeTab);

  const promotions = [
    {
      title: 'New Season, New You',
      description: 'Get 20% off on your first purchase from our new collection',
      code: 'NEW20',
      color: 'from-primary-500 to-accent-500',
    },
    {
      title: 'Free Express Shipping',
      description: 'On all new arrival orders over $100',
      code: 'EXPRESS',
      color: 'from-secondary-500 to-primary-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-secondary-50 via-surface to-background-light py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Fresh Drops Weekly
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-6">New Arrivals</h1>
            <p className="text-lg text-text-secondary mb-8 max-w-xl">
              Be the first to shop our latest styles. Fresh fashion, just landed and ready for you.
            </p>
            <a href="#collection"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25">
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-accent-100 rounded-full filter blur-3xl opacity-40" />
      </section>

      {/* Promo Cards */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {promotions.map((promo, index) => (
              <div key={index}
                className={`bg-gradient-to-r ${promo.color} rounded-2xl p-8 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-white/90 mb-4">{promo.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-mono font-bold">
                      Code: {promo.code}
                    </span>
                    <button onClick={() => copyCode(promo.code)}
                      className="bg-white text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
                      {copiedCode === promo.code ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full filter blur-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16" id="collection">
        <div className="max-w-7xl mx-auto px-4">

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-surface-light text-text-secondary hover:bg-secondary-50 border border-border-light'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
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

          {/* Empty */}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-20 text-text-muted">
              <Package className="w-16 h-16 mx-auto mb-4 text-border" />
              <p className="text-lg font-medium mb-2">
                {products.length === 0 ? 'No products yet' : 'No products in this category'}
              </p>
              {activeTab !== 'all' && (
                <button onClick={() => setActiveTab('all')}
                  className="mt-4 text-primary-500 hover:underline text-sm">
                  View all arrivals
                </button>
              )}
            </div>
          )}

          {/* Products */}
          {!isLoading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const daysAgo = getDaysAgo(product.createdAt);
                const badge = getBadge(daysAgo);
                const inWishlist = isInWishlist(product._id);
                return (
                  <Link key={product._id} to={`/product/${product._id}`}
                    className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light hover:border-primary-200">
                    <div className="relative overflow-hidden aspect-[3/4]">
                      {product.image ? (
                        <img src={product.image} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                          <Package className="w-16 h-16 text-primary-200" />
                        </div>
                      )}

                      {badge && (
                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${badge.color}`}>
                          {badge.label}
                          {badge.label === 'Just In' && <Zap className="w-3 h-3 inline-block ml-1 fill-white" />}
                        </span>
                      )}

                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-text-primary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1d ago' : `${daysAgo}d ago`}
                      </span>

                      <button
                        onClick={(e) => handleHeartClick(e, product)}
                        className={`absolute top-12 right-3 p-2.5 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 ${
                          inWishlist ? 'bg-danger-500 text-white opacity-100' : 'bg-white/95 text-text-primary hover:text-danger-500'
                        }`}>
                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="block w-full text-center bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all text-sm">
                          Quick View
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-text-muted mb-1">{product.category} · {product.brand}</p>
                      <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        {product.aggregateRating?.reviewCount > 0 ? (
                          <>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${
                                  i < Math.floor(product.aggregateRating.ratingValue)
                                    ? 'fill-warning-400 text-warning-400' : 'text-border'
                                }`} />
                              ))}
                            </div>
                            <span className="text-xs text-text-muted">({product.aggregateRating.reviewCount})</span>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted">No reviews yet</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">{formatCurrency(product.price, settings.currency)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.availability === 'InStock' ? 'bg-green-100 text-green-700' :
                          product.availability === 'OutOfStock' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {product.availability === 'InStock' ? 'In Stock' :
                           product.availability === 'OutOfStock' ? 'Sold Out' : 'Pre-Order'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-secondary-100 to-primary-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Get notified about new arrivals</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Subscribe to be the first to know about new collections and exclusive offers
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input type="email" placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none" />
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;

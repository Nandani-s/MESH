import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  X, 
  Trash2,
  ArrowRight,
  ShoppingCart,
  Share2,
  Gift,
  Filter,
  Loader2
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

const Wishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const { items, isLoading, toggleWishlist, clearWishlist } = useWishlist();
  const [sortBy, setSortBy] = useState('recent');

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-accent-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Sign in to view your wishlist</h2>
          <p className="text-text-muted mb-8">Save your favorite items and access them anytime.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  const removeItem = (product) => toggleWishlist(product);

  // Map populated wishlist items to a flat shape the UI expects
  const wishlistItems = items.map((item) => ({
    ...item.product,
    addedAt: item.addedAt,
    inStock: item.product?.availability === 'InStock',
    rating: item.product?.aggregateRating?.ratingValue || 0,
    reviews: item.product?.aggregateRating?.reviewCount || 0,
  }));

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt) - new Date(a.addedAt);
      case 'oldest':
        return new Date(a.addedAt) - new Date(b.addedAt);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const inStockItems = sortedItems.filter(item => item.inStock);
  const outOfStockItems = sortedItems.filter(item => !item.inStock);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-secondary-50 via-surface to-background-light py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2 fill-accent-500 text-accent-500" />
              My Favorites
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">My Wishlist</h1>
            <p className="text-text-secondary">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {wishlistItems.length === 0 ? (
            /* Empty Wishlist */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-accent-400" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">Your wishlist is empty</h2>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                Start saving your favorite items by clicking the heart icon on any product.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
              >
                Discover Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted">
                    {wishlistItems.length} items
                  </span>
                  <button
                    onClick={clearWishlist}
                    className="text-sm text-danger-500 hover:text-danger-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-surface-light border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-text-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-primary-300 transition-colors"
                    >
                      <option value="recent">Recently Added</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-light border border-border rounded-xl text-sm font-medium text-text-secondary hover:border-primary-300 hover:text-primary-500 transition-all">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>

              {/* In Stock Items */}
              {inStockItems.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    Available Items ({inStockItems.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {inStockItems.map((item) => (
                      <div
                        key={item._id}
                        className="group bg-surface-light rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 hover:shadow-xl transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden aspect-[3/4]">
                          <Link to={`/product/${item._id}`}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </Link>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item)}
                            className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg hover:scale-110"
                          >
                            <X className="w-4 h-4 text-text-primary" />
                          </button>

                          {/* Quick Actions Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex gap-2">
                              <button
                                className="flex-1 bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 text-sm"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => removeItem(item)}
                                className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center hover:bg-danger-500 hover:text-white transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <Link to={`/product/${item._id}`}>
                            <h3 className="font-semibold text-text-primary mb-2 line-clamp-1 hover:text-primary-500 transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.floor(item.rating)
                                      ? 'fill-warning-400 text-warning-400'
                                      : 'text-border'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-text-muted">({item.reviews})</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary-600">
                              {formatCurrency(item.price, settings.currency)}
                            </span>
                            <button
                              className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-4 h-4 text-primary-500" />
                            </button>
                          </div>
                          
                          <p className="text-xs text-text-muted mt-2">
                            Added {new Date(item.addedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock Items */}
              {outOfStockItems.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    Out of Stock ({outOfStockItems.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {outOfStockItems.map((item) => (
                      <div
                        key={item._id}
                        className="group bg-surface-light rounded-2xl overflow-hidden border border-border-light opacity-75"
                      >
                        <div className="relative overflow-hidden aspect-[3/4]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover grayscale"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold text-text-primary">
                              Out of Stock
                            </span>
                          </div>
                          <button
                            onClick={() => removeItem(item)}
                            className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
                          >
                            <X className="w-4 h-4 text-text-primary" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.floor(item.rating)
                                      ? 'fill-warning-400 text-warning-400'
                                      : 'text-border'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-text-muted">({item.reviews})</span>
                          </div>
                          <p className="text-lg font-bold text-text-muted">{formatCurrency(item.price, settings.currency)}</p>
                          <button className="w-full mt-3 py-2.5 border-2 border-border rounded-xl text-sm font-medium text-text-muted hover:border-primary-300 hover:text-primary-500 transition-all">
                            Notify When Available
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Move All to Cart */}
              {inStockItems.length > 0 && (
                <div className="mt-12 text-center">
                  <button className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25 flex items-center gap-2 mx-auto">
                    <ShoppingCart className="w-5 h-5" />
                    Add All to Cart ({inStockItems.length} items)
                  </button>
                </div>
              )}

              {/* Recommended */}
              <div className="mt-20">
                <div className="flex items-center gap-3 mb-8">
                  <Gift className="w-6 h-6 text-accent-500" />
                  <h2 className="text-2xl font-bold text-text-primary">Recommended For You</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { name: 'Summer Sandals', price: 59.99, rating: 4.4, reviews: 178, image: '/api/placeholder/300/400' },
                    { name: 'Pearl Necklace', price: 149.99, rating: 4.9, reviews: 45, image: '/api/placeholder/300/400' },
                    { name: 'Denim Jacket', price: 99.99, rating: 4.7, reviews: 312, image: '/api/placeholder/300/400' },
                    { name: 'Wide Leg Pants', price: 69.99, rating: 4.5, reviews: 143, image: '/api/placeholder/300/400' },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={`/product/${index + 1}`}
                      className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border-light hover:border-primary-200"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg">
                          <Heart className="w-4 h-4 text-text-primary hover:text-danger-500 transition-colors" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-text-primary mb-1">{item.name}</h3>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(item.rating)
                                    ? 'fill-warning-400 text-warning-400'
                                    : 'text-border'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-text-muted">({item.reviews})</span>
                        </div>
                        <p className="font-bold text-primary-600">{formatCurrency(item.price, settings.currency)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wishlist;
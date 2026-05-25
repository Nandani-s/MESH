import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Clock,
  Sparkles,
  ArrowRight,
  Gift,
  Zap
} from 'lucide-react';

const NewArrivals = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All New Arrivals' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'tops', label: 'Tops' },
    { id: 'bottoms', label: 'Bottoms' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const newArrivals = [
    {
      id: 1,
      name: 'Spring Floral Maxi',
      category: 'Dresses',
      price: 129.99,
      rating: 4.9,
      reviews: 28,
      image: '/api/placeholder/300/400',
      daysAgo: 1,
      badge: 'Just In'
    },
    {
      id: 2,
      name: 'Linen Blazer',
      category: 'Outerwear',
      price: 159.99,
      rating: 4.8,
      reviews: 15,
      image: '/api/placeholder/300/400',
      daysAgo: 2,
      badge: 'Trending'
    },
    {
      id: 3,
      name: 'Silk Cami Top',
      category: 'Tops',
      price: 69.99,
      rating: 4.7,
      reviews: 42,
      image: '/api/placeholder/300/400',
      daysAgo: 3,
      badge: 'New'
    },
    {
      id: 4,
      name: 'Wide Leg Trousers',
      category: 'Bottoms',
      price: 89.99,
      rating: 4.6,
      reviews: 31,
      image: '/api/placeholder/300/400',
      daysAgo: 4,
      badge: 'Popular'
    },
    {
      id: 5,
      name: 'Crystal Necklace',
      category: 'Accessories',
      price: 89.99,
      rating: 4.9,
      reviews: 19,
      image: '/api/placeholder/300/400',
      daysAgo: 5,
      badge: 'New'
    },
    {
      id: 6,
      name: 'Embroidered Dress',
      category: 'Dresses',
      price: 149.99,
      rating: 4.8,
      reviews: 23,
      image: '/api/placeholder/300/400',
      daysAgo: 2,
      badge: 'Exclusive'
    },
    {
      id: 7,
      name: 'Cashmere Sweater',
      category: 'Tops',
      price: 199.99,
      rating: 4.9,
      reviews: 12,
      image: '/api/placeholder/300/400',
      daysAgo: 1,
      badge: 'Premium'
    },
    {
      id: 8,
      name: 'Pleated Midi Skirt',
      category: 'Bottoms',
      price: 79.99,
      rating: 4.7,
      reviews: 37,
      image: '/api/placeholder/300/400',
      daysAgo: 7,
      badge: 'Trending'
    },
    {
      id: 9,
      name: 'Leather Tote Bag',
      category: 'Accessories',
      price: 179.99,
      rating: 4.8,
      reviews: 45,
      image: '/api/placeholder/300/400',
      daysAgo: 3,
      badge: 'Best Seller'
    },
  ];

  const promotions = [
    {
      title: 'New Season, New You',
      description: 'Get 20% off on your first purchase from our new collection',
      code: 'NEW20',
      color: 'from-primary-500 to-accent-500'
    },
    {
      title: 'Free Express Shipping',
      description: 'On all new arrival orders over $100',
      code: 'EXPRESS',
      color: 'from-secondary-500 to-primary-500'
    },
  ];

  const filteredArrivals = activeTab === 'all' 
    ? newArrivals 
    : newArrivals.filter(item => item.category.toLowerCase() === activeTab);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-50 via-surface to-background-light py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Fresh Drops Weekly
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-6">
              New Arrivals
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-xl">
              Be the first to shop our latest styles. Fresh fashion, just landed and ready for you.
            </p>
            <Link
              to="#collection"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-accent-100 rounded-full filter blur-3xl opacity-40"></div>
      </section>

      {/* Promo Cards */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {promotions.map((promo, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${promo.color} rounded-2xl p-8 text-white relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-white/90 mb-4">{promo.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-mono font-bold">
                      Code: {promo.code}
                    </span>
                    <button className="bg-white text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
                      Copy Code
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full filter blur-2xl"></div>
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-surface-light text-text-secondary hover:bg-secondary-50 border border-border-light'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArrivals.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light hover:border-primary-200"
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Badge */}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    product.badge === 'Just In' ? 'bg-success-500' :
                    product.badge === 'Trending' ? 'bg-warning-500' :
                    product.badge === 'Premium' ? 'bg-primary-500' :
                    product.badge === 'Exclusive' ? 'bg-accent-500' :
                    product.badge === 'Best Seller' ? 'bg-danger-500' :
                    'bg-secondary-500'
                  }`}>
                    {product.badge}
                    {product.badge === 'Just In' && <Zap className="w-3 h-3 inline-block ml-1 fill-white" />}
                  </span>
                  
                  {/* New Tag with Days */}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-text-primary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {product.daysAgo}d ago
                  </span>

                  {/* Wishlist */}
                  <button className="absolute top-14 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg">
                    <Heart className="w-5 h-5 text-text-primary hover:text-danger-500 transition-colors" />
                  </button>

                  {/* Quick View */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 text-sm">
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-text-muted mb-1">{product.category}</p>
                  <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-warning-400 text-warning-400'
                              : 'text-border'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-muted">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">${product.price}</span>
                    <button className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group/btn">
                      <Gift className="w-4 h-4 text-primary-500" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl font-semibold transition-all duration-300">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-secondary-100 to-primary-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Get notified about new arrivals
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Subscribe to be the first to know about new collections and exclusive offers
            </p>
            <form className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors">
                Notify Me
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;
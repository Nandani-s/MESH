import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Timer,
  Zap,
  Tag,
  Percent,
  Flame,
  ArrowRight
} from 'lucide-react';

const Sale = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 48
  });

  const saleProducts = [
    {
      id: 1,
      name: 'Designer Evening Dress',
      originalPrice: 299.99,
      price: 149.99,
      discount: 50,
      rating: 4.8,
      reviews: 156,
      image: '/api/placeholder/300/400',
      badge: '50% OFF'
    },
    {
      id: 2,
      name: 'Premium Silk Blouse',
      originalPrice: 199.99,
      price: 79.99,
      discount: 60,
      rating: 4.7,
      reviews: 89,
      image: '/api/placeholder/300/400',
      badge: '60% OFF'
    },
    {
      id: 3,
      name: 'Leather Handbag',
      originalPrice: 349.99,
      price: 174.99,
      discount: 50,
      rating: 4.9,
      reviews: 234,
      image: '/api/placeholder/300/400',
      badge: '50% OFF'
    },
    {
      id: 4,
      name: 'Cashmere Cardigan',
      originalPrice: 249.99,
      price: 99.99,
      discount: 60,
      rating: 4.6,
      reviews: 67,
      image: '/api/placeholder/300/400',
      badge: '60% OFF'
    },
    {
      id: 5,
      name: 'Designer Sunglasses',
      originalPrice: 159.99,
      price: 63.99,
      discount: 60,
      rating: 4.5,
      reviews: 198,
      image: '/api/placeholder/300/400',
      badge: '60% OFF'
    },
    {
      id: 6,
      name: 'Embroidered Kurta Set',
      originalPrice: 189.99,
      price: 94.99,
      discount: 50,
      rating: 4.8,
      reviews: 145,
      image: '/api/placeholder/300/400',
      badge: '50% OFF'
    },
    {
      id: 7,
      name: 'Wool Blend Coat',
      originalPrice: 399.99,
      price: 159.99,
      discount: 60,
      rating: 4.7,
      reviews: 78,
      image: '/api/placeholder/300/400',
      badge: '60% OFF'
    },
    {
      id: 8,
      name: 'Pearl Drop Earrings',
      originalPrice: 129.99,
      price: 51.99,
      discount: 60,
      rating: 4.9,
      reviews: 92,
      image: '/api/placeholder/300/400',
      badge: '60% OFF'
    },
    {
      id: 9,
      name: 'Ankle Strap Heels',
      originalPrice: 179.99,
      price: 89.99,
      discount: 50,
      rating: 4.6,
      reviews: 167,
      image: '/api/placeholder/300/400',
      badge: '50% OFF'
    },
  ];

  const flashDeals = [
    { name: 'Summer Dress', originalPrice: 89.99, price: 39.99, sold: 85, total: 100, image: '/api/placeholder/200/200' },
    { name: 'Denim Jacket', originalPrice: 129.99, price: 59.99, sold: 62, total: 80, image: '/api/placeholder/200/200' },
    { name: 'Silk Scarf', originalPrice: 49.99, price: 19.99, sold: 45, total: 50, image: '/api/placeholder/200/200' },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-danger-50 via-surface to-background-light py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-danger-100 text-danger-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Flame className="w-4 h-4 mr-2" />
              Limited Time Sale
            </div>
            <h1 className="text-4xl lg:text-7xl font-bold text-text-primary mb-6">
              Up to 60% Off
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-xl">
              Don't miss out on these incredible deals. Shop your favorites before they're gone!
            </p>
            
            {/* Countdown Timer */}
            <div className="flex gap-4 mb-8">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-surface-light rounded-2xl shadow-lg flex items-center justify-center border border-border-light">
                    <span className="text-2xl lg:text-3xl font-bold text-primary-600">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted mt-2 block">{item.label}</span>
                </div>
              ))}
            </div>

            <Link
              to="#deals"
              className="inline-flex items-center gap-2 bg-danger-500 hover:bg-danger-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-danger-500/25"
            >
              Shop Sale
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-danger-100 rounded-full filter blur-3xl opacity-50"></div>
      </section>

      {/* Flash Deals */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-8 h-8 text-warning-500 fill-warning-500" />
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Flash Deals</h2>
            <span className="bg-warning-100 text-warning-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              Ending Soon
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {flashDeals.map((deal, index) => (
              <div key={index} className="bg-surface-light rounded-2xl p-5 border border-border-light hover:border-warning-300 hover:shadow-xl transition-all duration-300">
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-1">{deal.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-danger-600">${deal.price}</span>
                      <span className="text-sm text-text-muted line-through">${deal.originalPrice}</span>
                    </div>
                    <span className="inline-block bg-danger-100 text-danger-600 px-2 py-0.5 rounded-lg text-xs font-semibold">
                      {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-muted">Sold: {deal.sold}</span>
                    <span className="text-danger-500 font-medium">{deal.total - deal.sold} left</span>
                  </div>
                  <div className="w-full bg-background-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-warning-500 to-danger-500 h-2 rounded-full transition-all"
                      style={{ width: `${(deal.sold / deal.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sale Products Grid */}
      <section className="py-16" id="deals">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="w-8 h-8 text-danger-500" />
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">All Sale Items</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {saleProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light hover:border-danger-200"
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Discount Badge */}
                  <span className="absolute top-3 left-3 bg-danger-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.badge}
                  </span>
                  
                  {/* Wishlist */}
                  <button className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg">
                    <Heart className="w-5 h-5 text-text-primary hover:text-danger-500 transition-colors" />
                  </button>

                  {/* Quick Add */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-danger-500 hover:text-white transition-all duration-300 text-sm">
                      Quick Add
                    </button>
                  </div>
                </div>

                <div className="p-4">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-danger-600">${product.price}</span>
                    <span className="text-sm text-text-muted line-through">${product.originalPrice}</span>
                    <span className="ml-auto bg-danger-100 text-danger-600 px-2 py-0.5 rounded-lg text-xs font-semibold">
                      -{product.discount}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-danger-500 hover:bg-danger-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-danger-500/25">
              Load More Deals
            </button>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-gradient-to-br from-danger-500 via-danger-600 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Percent className="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Extra 10% Off on Orders Over $200
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Use code: <span className="font-bold bg-white/20 px-4 py-1 rounded-lg">EXTRA10</span>
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-danger-600 px-8 py-4 rounded-2xl font-semibold hover:bg-danger-50 transition-all duration-300 transform hover:scale-105"
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Sale;
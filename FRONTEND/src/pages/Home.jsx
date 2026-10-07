import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, Truck, Shield, RotateCcw, HeadphonesIcon,
  ArrowRight, Heart, Loader2, Package
} from 'lucide-react';
import { categoryApi } from '../api/categories';
import { productApi } from '../api/products';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    categoryApi.getAll()
      .then((res) => {
        const active = (res.data || []).filter(c => c.status === 'active');
        setCategories(active);
      })
      .catch(() => {})
      .finally(() => setIsLoadingCategories(false));

    productApi.getAll()
      .then((res) => {
        // Sort by newest first, take 4 for the homepage
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sorted.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const handleHeartClick = async (e, product) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product);
  };

  // Feature highlights — free shipping threshold pulled from settings
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: settings.freeShippingThreshold > 0
        ? `On orders over ${formatCurrency(settings.freeShippingThreshold, settings.currency)}`
        : 'On all orders',
    },
    { icon: Shield, title: 'Secure Payment', description: '100% secure transactions' },
    { icon: RotateCcw, title: 'Easy Returns', description: '30-day return window' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Always here to help' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-50 via-surface to-background-light">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-accent-100 text-accent-700 px-5 py-2.5 rounded-full text-sm font-semibold">
                <span className="w-2.5 h-2.5 bg-accent-500 rounded-full mr-2.5 animate-pulse"></span>
                New Collection 2024
              </div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary leading-tight">
                Elevate Your
                <span className="block bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  Everyday Style
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
                Discover a curated collection of elegant fashion pieces designed to make you feel confident and beautiful every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop"
                  className="group bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25 flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/categories"
                  className="group border-2 border-border-strong hover:border-primary-500 text-text-primary px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-primary-50">
                  View Collection
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-text-primary">50K+</div>
                  <div className="text-sm text-text-muted">Happy Customers</div>
                </div>
                <div className="w-px h-12 bg-border-light"></div>
                <div>
                  <div className="text-3xl font-bold text-text-primary">4.8</div>
                  <div className="text-sm text-text-muted flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                    Rating
                  </div>
                </div>
                <div className="w-px h-12 bg-border-light"></div>
                <div>
                  <div className="text-3xl font-bold text-text-primary">
                    {isLoadingProducts ? '...' : `${products.length > 0 ? '50+' : '0'}`}
                  </div>
                  <div className="text-sm text-text-muted">Products</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 to-accent-100 aspect-[3/4] flex items-center justify-center">
                <Package className="w-32 h-32 text-primary-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              <div className="absolute -top-6 -right-6 bg-surface-light shadow-2xl rounded-2xl p-5 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="bg-success-100 p-3 rounded-xl">
                    <Star className="w-6 h-6 text-success-500 fill-success-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary">Top Rated</div>
                    <div className="text-xs text-text-muted">2024 Collection</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-surface-light shadow-2xl rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="text-sm font-bold text-accent-600">Trending Now</div>
                    <div className="text-xs text-text-muted">Hot Picks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index}
                className="group bg-surface-light hover:bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border border-border-light hover:border-primary-200">
                <div className="w-20 h-20 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">Shop by Category</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Find your perfect style from our carefully curated collections
            </p>
          </div>

          {isLoadingCategories ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>No categories available yet.</p>
              <Link to="/shop" className="text-primary-500 hover:underline mt-2 inline-block">Browse all products →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {categories.map((category) => (
                <Link key={category._id} to={`/category/${category.slug}`} className="group cursor-pointer">
                  <div className="relative mb-5 overflow-hidden rounded-full aspect-square shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                    {category.image && !category.image.startsWith('http') ? (
                      <span className="text-5xl">{category.image}</span>
                    ) : category.image ? (
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-end justify-center pb-6">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-text-muted">{category.productCount} Items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/categories"
              className="inline-flex items-center gap-2 border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300">
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">New Arrivals</h2>
              <p className="text-text-secondary text-lg">Fresh styles just landed for you</p>
            </div>
            <Link to="/shop"
              className="hidden lg:flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors group">
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <Package className="w-16 h-16 mx-auto mb-4 text-border" />
              <p className="text-lg font-medium mb-2">No products yet</p>
              <p className="text-sm">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => {
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
                      <span className="absolute top-4 left-4 bg-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                        New
                      </span>
                      <button
                        className={`absolute top-4 right-4 p-3 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 ${
                          inWishlist ? 'bg-danger-500 text-white' : 'bg-white/95 text-text-primary hover:text-danger-500'
                        }`}
                        onClick={(e) => handleHeartClick(e, product)}
                      >
                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="block w-full text-center bg-white text-text-primary py-3 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          Quick View
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-text-muted mb-1">{product.brand}</p>
                      <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        {product.aggregateRating?.reviewCount > 0 ? (
                          <>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${
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
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(product.price, settings.currency)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.availability === 'InStock' ? 'bg-green-100 text-green-700' :
                          product.availability === 'OutOfStock' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {product.availability === 'InStock' ? 'In Stock' :
                           product.availability === 'OutOfStock' ? 'Out of Stock' : 'Pre-Order'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center lg:hidden">
            <Link to="/shop"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold transition-colors group border-2 border-primary-500 px-8 py-3 rounded-xl hover:bg-primary-500 hover:text-white">
              View All Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

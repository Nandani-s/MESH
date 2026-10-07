import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Star, Package, ArrowLeft,
  Truck, Shield, RotateCcw, ChevronRight, Loader2,
  AlertCircle, Minus, Plus, Share2
} from 'lucide-react';
import { productApi } from '../api/products';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    setQuantity(1);

    Promise.all([
      productApi.getById(id),
      productApi.getAll(),
    ])
      .then(([prodRes, allRes]) => {
        const p = prodRes.data;
        setProduct(p);
        // Related: same category, different product, max 4
        const related = (allRes.data || [])
          .filter(r => r.category === p.category && r._id !== p._id)
          .slice(0, 4);
        setRelatedProducts(related);
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleHeartClick = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await toggleWishlist(product);
  };

  // ← CHANGED #3: real cart integration (was placeholder)
  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!product) return;
    if (product.availability === 'OutOfStock') return;

    const ok = await addToCart(product._id, quantity);
    if (ok) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-danger-400 mx-auto mb-4" />
        <p className="text-text-muted mb-6">{error || 'Product not found'}</p>
        <Link to="/shop" className="inline-flex items-center gap-2 text-primary-500 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    </div>
  );

  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discount = isOnSale
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.availability === 'OutOfStock';
  const currency = settings?.currency || 'NPR';

  return (
    <div className="min-h-screen bg-background-light">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-primary-500 transition-colors">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/category/${product.category.toLowerCase()}`}
                className="hover:text-primary-500 transition-colors capitalize">{product.category}</Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-primary truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-gradient-to-br from-primary-50 to-accent-50 shadow-xl">
              {product.image ? (
                <img src={product.image} alt={product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-primary-200" />
                </div>
              )}
              {isOnSale && (
                <span className="absolute top-4 left-4 bg-danger-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                  -{discount}% OFF
                </span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl text-lg font-bold text-text-primary">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <p className="text-sm text-text-muted mb-1">{product.brand} · {product.category}</p>
                  <h1 className="text-3xl font-bold text-text-primary">{product.name}</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare}
                    className="p-2.5 border border-border-light rounded-xl hover:bg-background-muted transition-colors"
                    title="Copy link">
                    <Share2 className="w-5 h-5 text-text-secondary" />
                  </button>
                  <button onClick={handleHeartClick}
                    className={`p-2.5 border rounded-xl transition-colors ${
                      inWishlist
                        ? 'bg-danger-50 border-danger-200 text-danger-500'
                        : 'border-border-light hover:bg-background-muted text-text-secondary'
                    }`}>
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              {product.aggregateRating?.reviewCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${
                        i < Math.floor(product.aggregateRating.ratingValue)
                          ? 'fill-warning-400 text-warning-400' : 'text-border'
                      }`} />
                    ))}
                  </div>
                  <span className="text-sm text-text-muted">
                    {product.aggregateRating.ratingValue.toFixed(1)} ({product.aggregateRating.reviewCount} reviews)
                  </span>
                </div>
              ) : (
                <p className="text-sm text-text-muted">No reviews yet</p>
              )}
            </div>

            {/* Price */}
            <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-bold ${isOnSale ? 'text-danger-600' : 'text-primary-600'}`}>
                  {formatCurrency(product.price, currency)}
                </span>
                {isOnSale && (
                  <div className="flex flex-col">
                    <span className="text-lg text-text-muted line-through">
                      {formatCurrency(product.originalPrice, currency)}
                    </span>
                    <span className="text-sm text-success-600 font-medium">
                      You save {formatCurrency(product.originalPrice - product.price, currency)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                  product.availability === 'InStock' ? 'bg-green-100 text-green-700' :
                  product.availability === 'OutOfStock' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {product.availability === 'InStock' ? '✓ In Stock' :
                   product.availability === 'OutOfStock' ? '✗ Out of Stock' : '⏳ Pre-Order'}
                </span>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-sm text-orange-600 font-medium">
                    Only {product.stock} left!
                  </span>
                )}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-text-primary">Quantity</label>
                  <div className="flex items-center border border-border-light rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2.5 hover:bg-background-muted transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-2.5 font-semibold border-x border-border-light min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                      className="px-4 py-2.5 hover:bg-background-muted transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    addedToCart
                      ? 'bg-success-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-xl hover:shadow-primary-500/25 transform hover:scale-[1.02]'
                  }`}>
                  <ShoppingCart className="w-6 h-6" />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-text-secondary leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-surface-light rounded-2xl p-5 border border-border-light space-y-3">
              <h3 className="font-semibold text-text-primary">Product Details</h3>
              {[
                { label: 'Brand', value: product.brand },
                { label: 'Category', value: product.category },
                { label: 'Stock', value: `${product.stock} units` },
                { label: 'Currency', value: product.priceCurrency || 'USD' },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-text-muted">{label}</span>
                  <span className="text-text-primary font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: Shield, label: 'Secure Payment' },
                { icon: RotateCcw, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 bg-surface-light rounded-xl border border-border-light text-center">
                  <Icon className="w-5 h-5 text-primary-500" />
                  <span className="text-xs text-text-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Related Products</h2>
              <Link to={`/category/${product.category?.toLowerCase()}`}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => {
                const relInWishlist = isInWishlist(related._id);
                const relOnSale = related.originalPrice && related.originalPrice > related.price;
                return (
                  <Link key={related._id} to={`/product/${related._id}`}
                    className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border-light hover:border-primary-200">
                    <div className="relative overflow-hidden aspect-[3/4]">
                      {related.image ? (
                        <img src={related.image} alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                          <Package className="w-12 h-12 text-primary-200" />
                        </div>
                      )}
                      {relOnSale && (
                        <span className="absolute top-2 left-2 bg-danger-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          -{Math.round(((related.originalPrice - related.price) / related.originalPrice) * 100)}%
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); if (!isAuthenticated) { navigate('/login'); return; } toggleWishlist(related); }}
                        className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg ${
                          relInWishlist ? 'bg-danger-500 text-white opacity-100' : 'bg-white/95 text-text-primary hover:text-danger-500'
                        }`}>
                        <Heart className={`w-4 h-4 ${relInWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-text-muted mb-1">{related.brand}</p>
                      <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">{related.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${relOnSale ? 'text-danger-600' : 'text-primary-600'}`}>
                          {formatCurrency(related.price, currency)}
                        </span>
                        {relOnSale && (
                          <span className="text-xs text-text-muted line-through">{formatCurrency(related.originalPrice, currency)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
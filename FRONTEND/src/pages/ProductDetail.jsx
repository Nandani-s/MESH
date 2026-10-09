import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Star, ArrowLeft,
  Truck, Shield, RotateCcw, ChevronRight, Loader2,
  AlertCircle, Minus, Plus, Share2, ZoomIn
} from 'lucide-react';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import { trackAnalyticsEvent } from '../utils/analyticsTracking';
import Breadcrumb from '../components/ui/Breadcrumb';
import ProductCard from '../components/ui/ProductCard';
import ProductImage from '../components/ui/ProductImage';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'details', label: 'Details' },
  { id: 'shipping', label: 'Shipping & Returns' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [detail, setDetail] = useState(null); // { productId, product, related, categorySlug }
  const [failure, setFailure] = useState(null); // { productId, message }
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const isCurrent = detail && detail.productId === id;
  const product = isCurrent ? detail.product : null;
  const relatedProducts = isCurrent ? detail.related : [];
  const categorySlug = isCurrent ? detail.categorySlug : null;
  const error = failure && failure.productId === id ? failure.message : '';
  const isLoading = !error && (!detail || !isCurrent);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      productApi.getById(id),
      productApi.getAll(),
      categoryApi.getAll(),
    ])
      .then(([prodRes, allRes, catRes]) => {
        if (cancelled) return;
        const p = prodRes.data;
        const related = (allRes.data || [])
          .filter(r => r.category === p.category && r._id !== p._id)
          .slice(0, 4);
        const cat = (catRes.data || []).find(
          c => c.name?.toLowerCase() === (p.category || '').toLowerCase()
        );
        setDetail({
          productId: id,
          product: p,
          related,
          categorySlug: cat?.slug || null,
        });
        trackAnalyticsEvent('product_view', { productId: id });
        setFailure(null);
        setQuantity(1);
        setActiveTab('description');
      })
      .catch(() => {
        if (!cancelled) setFailure({ productId: id, message: 'Product not found.' });
      });

    return () => {
      cancelled = true;
    };
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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <Breadcrumb
          items={[
            { label: 'Shop', to: '/shop' },
            ...(product.category
              ? [
                  {
                    label: product.category,
                    to: categorySlug ? `/category/${categorySlug}` : undefined,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Image */}
          <div className="space-y-4 lg:sticky lg:top-36">
            <div className="group relative rounded-3xl overflow-hidden aspect-square bg-gradient-to-br from-primary-50 to-accent-50 shadow-xl cursor-zoom-in">
              <ProductImage src={product.image} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {product.image && (
                <span className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Hover to zoom">
                  <ZoomIn className="w-4 h-4" />
                </span>
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
                  product.availability === 'InStock' ? 'bg-success-100 text-success-700' :
                  product.availability === 'OutOfStock' ? 'bg-danger-100 text-danger-700' :
                  'bg-warning-100 text-warning-700'
                }`}>
                  {product.availability === 'InStock' ? '✓ In Stock' :
                   product.availability === 'OutOfStock' ? '✗ Out of Stock' : '⏳ Pre-Order'}
                </span>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-sm text-warning-600 font-medium">
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

            {/* Tabs */}
            <div className="border border-border-light rounded-2xl overflow-hidden bg-surface-light">
              <div className="flex border-b border-border-light" role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-text-muted hover:text-text-primary hover:bg-background-muted'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'description' && (
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                    {product.description || 'No description available for this product yet.'}
                  </p>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-3">
                    {[
                      { label: 'Brand', value: product.brand },
                      { label: 'Category', value: product.category },
                      { label: 'Stock', value: product.stock != null ? `${product.stock} units` : null },
                      { label: 'SKU', value: product._id?.slice(-8).toUpperCase() },
                      { label: 'Currency', value: settings.currency },
                    ].map(({ label, value }) => value && (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-text-muted">{label}</span>
                        <span className="text-text-primary font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li className="flex items-start gap-3">
                      <Truck className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                      {settings.freeShippingThreshold > 0
                        ? `Free shipping on orders over ${formatCurrency(settings.freeShippingThreshold, settings.currency)}.`
                        : 'Free shipping on all orders.'}
                    </li>
                    <li className="flex items-start gap-3">
                      <RotateCcw className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                      Easy 30-day returns — unused items with tags attached.
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                      Pay on delivery, or securely with Khalti and eSewa.
                    </li>
                  </ul>
                )}
              </div>
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
          <div className="mt-16 lg:mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary-500 mb-2">
                  You may also like
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-text-primary">Related Products</h2>
              </div>
              {categorySlug && (
                <Link to={`/category/${categorySlug}`}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
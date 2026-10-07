import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Package, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';

const AVAILABILITY_STYLES = {
  InStock: 'bg-success-100 text-success-700',
  OutOfStock: 'bg-danger-100 text-danger-700',
  PreOrder: 'bg-warning-100 text-warning-700',
};

const AVAILABILITY_LABELS = {
  InStock: 'In Stock',
  OutOfStock: 'Sold Out',
  PreOrder: 'Pre-Order',
};

// Captured once at module load so render stays pure (React compiler rule)
const NOW = Date.now();

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [cartStatus, setCartStatus] = useState('idle');

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const isNew = product.createdAt
    ? NOW - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;
  const rating = product.aggregateRating;
  const hasReviews = rating && rating.reviewCount > 0;

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (product.availability === 'OutOfStock' || cartStatus === 'adding') return;

    setCartStatus('adding');
    const added = await addToCart(product._id);
    setCartStatus(added ? 'added' : 'error');
    window.setTimeout(() => setCartStatus('idle'), 1800);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-light bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-secondary-50 via-background-light to-primary-50">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Package className="w-12 h-12 text-primary-200" />
            <span className="text-xs text-text-muted">Image unavailable</span>
          </div>
        )}
        {product.image && !imageError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/10 to-transparent" />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="rounded-full bg-primary-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
              New
            </span>
          )}
          {hasDiscount > 0 && (
            <span className="rounded-full bg-danger-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
              -{hasDiscount}%
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleHeartClick}
          className={`absolute right-3 top-3 rounded-full p-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
            inWishlist
              ? 'bg-danger-500 text-white'
              : 'bg-white/95 text-text-primary hover:text-danger-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 min-h-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {product.brand}
          {product.category ? ` · ${product.category}` : ''}
        </p>
        <h3 className="mb-2 min-h-10 text-sm font-semibold leading-5 text-text-primary line-clamp-2 transition-colors group-hover:text-primary-600">
          {product.name}
        </h3>

        <div className="mb-3 flex min-h-4 items-center gap-1.5">
          {hasReviews ? (
            <>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating.ratingValue)
                        ? 'fill-warning-400 text-warning-400'
                        : 'text-border-strong'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-text-muted">
                {Number(rating.ratingValue).toFixed(1)}
                <span className="mx-1 text-border-strong">|</span>
                {rating.reviewCount} review{rating.reviewCount > 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-text-muted">No reviews yet</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-base font-bold text-primary-600">
              {formatCurrency(product.price, settings.currency)}
            </span>
            {hasDiscount > 0 && (
              <span className="text-xs text-text-muted line-through">
                {formatCurrency(product.originalPrice, settings.currency)}
              </span>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
              AVAILABILITY_STYLES[product.availability] || AVAILABILITY_STYLES.InStock
            }`}
          >
            {AVAILABILITY_LABELS[product.availability] || AVAILABILITY_LABELS.InStock}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.availability === 'OutOfStock' || cartStatus === 'adding'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-border-strong disabled:shadow-none"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {cartStatus === 'adding' ? 'Adding...' : cartStatus === 'added' ? 'Added to cart' : cartStatus === 'error' ? 'Try again' : product.availability === 'OutOfStock' ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;

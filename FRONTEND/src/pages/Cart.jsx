import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  ShoppingCart, Loader2, Tag, ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import PageHeader from '../components/ui/PageHeader';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { items, isLoading, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { settings } = useSettings();

  if (isAuthLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <ShoppingCart className="w-20 h-20 text-primary-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-text-primary mb-3">Sign in to view your cart</h2>
        <p className="text-text-muted mb-8">Your cart items are saved when you sign in.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">Sign In</Link>
          <Link to="/register" className="border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-6 py-3 rounded-xl font-semibold transition-all">Register</Link>
        </div>
      </div>
    </div>
  );

  // Shipping calculation from settings
  const freeShippingThreshold = settings.freeShippingThreshold || 0;
  const shippingRate = settings.standardShippingRate || 0;
  const shippingCost = freeShippingThreshold > 0 && cartTotal >= freeShippingThreshold ? 0 : shippingRate;
  const orderTotal = cartTotal + shippingCost;
  const amountToFreeShipping = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - cartTotal) : 0;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        eyebrow="Your Bag"
        title="Shopping Cart"
        subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'} ready for checkout`}
        breadcrumb={[{ label: 'Cart' }]}
        action={
          items.length > 0 ? (
            <button onClick={clearCart}
              className="text-sm text-danger-500 hover:text-danger-600 flex items-center gap-1 transition-colors font-medium">
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          ) : null
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-border mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">Your cart is empty</h2>
            <p className="text-text-muted mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/shop"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all">
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping progress */}
              {freeShippingThreshold > 0 && amountToFreeShipping > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-primary-500" />
                    <p className="text-sm text-primary-700 font-medium">
                      Add <span className="font-bold">{formatCurrency(amountToFreeShipping, settings.currency)}</span> more for free shipping!
                    </p>
                  </div>
                  <div className="w-full bg-primary-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((cartTotal / freeShippingThreshold) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
              {freeShippingThreshold > 0 && amountToFreeShipping === 0 && (
                <div className="bg-success-50 border border-success-200 rounded-2xl p-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-success-500" />
                  <p className="text-sm text-success-700 font-medium">🎉 You've unlocked free shipping!</p>
                </div>
              )}

              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isOnSale = product.originalPrice && product.originalPrice > product.price;
                const itemTotal = product.price * item.quantity;

                return (
                  <div key={product._id}
                    className="bg-surface-light rounded-2xl border border-border-light p-5 flex gap-5 hover:shadow-md transition-shadow">
                    {/* Image */}
                    <Link to={`/product/${product._id}`}
                      className="w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-background-muted">
                      {product.image ? (
                        <img src={product.image} alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-primary-200" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-text-muted mb-0.5">{product.brand} · {product.category}</p>
                          <Link to={`/product/${product._id}`}
                            className="font-semibold text-text-primary hover:text-primary-500 transition-colors line-clamp-1">
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-lg font-bold ${isOnSale ? 'text-danger-600' : 'text-primary-600'}`}>
                              {formatCurrency(product.price, settings.currency)}
                            </span>
                            {isOnSale && (
                              <span className="text-sm text-text-muted line-through">
                                {formatCurrency(product.originalPrice, settings.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(product._id)}
                          className="p-2 text-text-muted hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-border-light rounded-xl overflow-hidden">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => {
                              if (item.quantity === 1) removeFromCart(product._id);
                              else updateQuantity(product._id, item.quantity - 1);
                            }}
                            className="px-3 py-1.5 hover:bg-background-muted transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 py-1.5 font-semibold text-sm border-x border-border-light min-w-[40px] text-center"
                            title={`Quantity: ${item.quantity}`}>
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="px-3 py-1.5 hover:bg-background-muted transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Item total */}
                        <span className="font-bold text-text-primary">{formatCurrency(itemTotal, settings.currency)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-light rounded-2xl border border-border-light p-6 sticky top-28 lg:top-36">
                <h2 className="text-xl font-bold text-text-primary mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal ({cartCount} items)</span>
                    <span className="font-medium text-text-primary">{formatCurrency(cartTotal, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-success-600' : 'text-text-primary'}`}>
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost, settings.currency)}
                    </span>
                  </div>
                  <div className="border-t border-border-light pt-3 flex justify-between">
                    <span className="font-bold text-text-primary">Total</span>
                    <span className="text-xl font-bold text-primary-600">{formatCurrency(orderTotal, settings.currency)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link to="/shop"
                  className="block text-center mt-4 text-sm text-text-muted hover:text-primary-500 transition-colors">
                  ← Continue Shopping
                </Link>

                {/* Payment icons */}
                <div className="mt-6 pt-4 border-t border-border-light">
                  <p className="text-xs text-text-muted text-center mb-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Payment Options
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {settings.codEnabled && (
                      <span className="px-3 py-1.5 bg-background-muted rounded-lg text-xs font-medium text-text-secondary">
                        Cash on Delivery
                      </span>
                    )}
                    {settings.khaltiEnabled && (
                      <span className="px-3 py-1.5 bg-background-muted rounded-lg text-xs font-medium text-text-secondary">
                        Khalti
                      </span>
                    )}
                    {settings.esewaEnabled && (
                      <span className="px-3 py-1.5 bg-background-muted rounded-lg text-xs font-medium text-text-secondary">
                        eSewa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

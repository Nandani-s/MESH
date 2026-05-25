import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Minus, 
  Plus, 
  X, 
  Heart,
  ShoppingBag,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Tag,
  ChevronRight,
  Trash2
} from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Floral Summer Dress',
      price: 89.99,
      originalPrice: 129.99,
      size: 'M',
      color: 'Pink',
      quantity: 2,
      image: '/api/placeholder/200/250',
      inStock: true
    },
    {
      id: 2,
      name: 'Elegant Evening Gown',
      price: 149.99,
      originalPrice: 199.99,
      size: 'S',
      color: 'Black',
      quantity: 1,
      image: '/api/placeholder/200/250',
      inStock: true
    },
    {
      id: 3,
      name: 'Casual Linen Top',
      price: 49.99,
      size: 'L',
      color: 'White',
      quantity: 3,
      image: '/api/placeholder/200/250',
      inStock: true
    },
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'FASHION20') {
      setPromoApplied(true);
      setPromoDiscount(subtotal * 0.2);
    } else if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoApplied(true);
      setPromoDiscount(subtotal * 0.1);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal - promoDiscount + shipping + tax;

  const savedAmount = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-secondary-50 via-surface to-background-light py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">Shopping Cart</h1>
            <p className="text-text-secondary">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">Your cart is empty</h2>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Start shopping and find your perfect style!
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Free Shipping Progress */}
                {subtotal < 100 && (
                  <div className="bg-warning-50 border border-warning-200 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Truck className="w-5 h-5 text-warning-600" />
                      <p className="text-sm font-medium text-warning-700">
                        Add ${(100 - subtotal).toFixed(2)} more to get FREE shipping!
                      </p>
                    </div>
                    <div className="w-full bg-warning-200 rounded-full h-2">
                      <div
                        className="bg-warning-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {subtotal >= 100 && (
                  <div className="bg-success-50 border border-success-200 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-success-600" />
                      <p className="text-sm font-medium text-success-700">
                        You've qualified for FREE shipping! 🎉
                      </p>
                    </div>
                  </div>
                )}

                {/* Cart Items List */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-light rounded-2xl p-5 border border-border-light hover:border-primary-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex gap-5">
                      {/* Product Image */}
                      <Link to={`/product/${item.id}`} className="w-24 h-32 lg:w-32 lg:h-40 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              to={`/product/${item.id}`}
                              className="font-semibold text-text-primary hover:text-primary-500 transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-sm text-text-muted">Size: {item.size}</span>
                              <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                              <span className="text-sm text-text-muted">Color: {item.color}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-text-muted hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price & Quantity */}
                        <div className="flex items-end justify-between mt-4">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl font-bold text-primary-600">
                                ${item.price.toFixed(2)}
                              </span>
                              {item.originalPrice && (
                                <>
                                  <span className="text-sm text-text-muted line-through">
                                    ${item.originalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs bg-danger-100 text-danger-600 px-2 py-0.5 rounded-lg font-semibold">
                                    Save ${(item.originalPrice - item.price).toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-9 h-9 rounded-lg border-2 border-border hover:border-primary-500 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-semibold text-text-primary">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= 10}
                                className="w-9 h-9 rounded-lg border-2 border-border hover:border-primary-500 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-sm text-text-muted mb-1">Total</p>
                            <p className="text-lg font-bold text-text-primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-light">
                          <button className="flex items-center gap-2 text-sm text-text-muted hover:text-danger-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            Move to Wishlist
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-2 text-sm text-text-muted hover:text-danger-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Continue Shopping */}
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors group mt-4"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Summary Card */}
                  <div className="bg-surface-light rounded-2xl p-6 border border-border-light">
                    <h2 className="text-xl font-bold text-text-primary mb-6">Order Summary</h2>

                    {/* Promo Code */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Promo Code
                      </label>
                      {!promoApplied ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter code"
                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm"
                          />
                          <button
                            onClick={applyPromoCode}
                            className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-success-50 border border-success-200 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-success-600" />
                            <span className="text-sm font-medium text-success-700">
                              Code Applied!
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setPromoApplied(false);
                              setPromoDiscount(0);
                              setPromoCode('');
                            }}
                            className="text-xs text-success-600 hover:text-success-700 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-text-muted mt-2">
                        Try: FASHION20 or WELCOME10
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 pb-6 border-b border-border-light">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Subtotal</span>
                        <span className="font-medium text-text-primary">${subtotal.toFixed(2)}</span>
                      </div>
                      
                      {promoDiscount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-success-600">Discount</span>
                          <span className="font-medium text-success-600">-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Shipping</span>
                        {shipping === 0 ? (
                          <span className="font-medium text-success-600">FREE</span>
                        ) : (
                          <span className="font-medium text-text-primary">${shipping.toFixed(2)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Tax</span>
                        <span className="font-medium text-text-primary">${tax.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between py-4">
                      <span className="text-lg font-bold text-text-primary">Total</span>
                      <span className="text-2xl font-bold text-primary-600">${total.toFixed(2)}</span>
                    </div>

                    {savedAmount > 0 && (
                      <div className="bg-success-50 rounded-xl p-3 mb-4">
                        <p className="text-sm text-success-700 text-center">
                          🎉 You're saving ${savedAmount.toFixed(2)} on this order!
                        </p>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Payment Methods */}
                    <div className="mt-6 text-center">
                      <p className="text-xs text-text-muted mb-3">We Accept</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-8 bg-background-muted rounded flex items-center justify-center text-xs font-semibold">VISA</div>
                        <div className="w-12 h-8 bg-background-muted rounded flex items-center justify-center text-xs font-semibold">MC</div>
                        <div className="w-12 h-8 bg-background-muted rounded flex items-center justify-center text-xs font-semibold">AMEX</div>
                        <div className="w-12 h-8 bg-background-muted rounded flex items-center justify-center text-xs font-semibold">PP</div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="bg-surface-light rounded-2xl p-6 border border-border-light space-y-3">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Free Shipping</p>
                        <p className="text-xs text-text-muted">On orders over $100</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Secure Checkout</p>
                        <p className="text-xs text-text-muted">SSL encrypted payment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Easy Returns</p>
                        <p className="text-xs text-text-muted">30-day return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {cartItems.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-text-primary mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Designer Handbag', price: 199.99, image: '/api/placeholder/300/400' },
                  { name: 'Silk Scarf', price: 49.99, image: '/api/placeholder/300/400' },
                  { name: 'Ankle Boots', price: 159.99, image: '/api/placeholder/300/400' },
                  { name: 'Statement Necklace', price: 79.99, image: '/api/placeholder/300/400' },
                ].map((item, index) => (
                  <Link
                    key={index}
                    to="/shop"
                    className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border-light hover:border-primary-200"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-text-primary mb-1">{item.name}</h3>
                      <p className="font-bold text-primary-600">${item.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;

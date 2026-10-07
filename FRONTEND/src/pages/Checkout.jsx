import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, User, CreditCard,
  Wallet, Banknote, Loader2, ShoppingBag, AlertCircle,
  Check, Package
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { apiPost } from '../api/client';
import { formatCurrency } from '../utils/formatCurrency';
import { paymentApi } from '../api/payment';
import PageHeader from '../components/ui/PageHeader';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, cartTotal, cartCount, refetch } = useCart();
  const { settings } = useSettings();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState(
    settings.codEnabled ? 'COD' :
    settings.khaltiEnabled ? 'Khalti' :
    settings.esewaEnabled ? 'eSewa' : 'COD'
  );

  // ─── Shipping ───
  const freeShippingThreshold = settings.freeShippingThreshold || 0;
  const shippingRate = settings.standardShippingRate || 0;
  const shippingCost = freeShippingThreshold > 0 && cartTotal >= freeShippingThreshold ? 0 : shippingRate;
  const orderTotal = cartTotal + shippingCost;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-border mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link to="/shop" className="text-primary-500 hover:underline">Go shopping →</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) return 'Phone must be 10 digits';
    if (!form.address.trim()) return 'Address is required';
    if (!form.city.trim()) return 'City is required';
    return null;
  };

  const shippingComplete = validate() === null;
  const steps = [
    { label: 'Details', done: shippingComplete },
    { label: 'Payment', done: shippingComplete },
    { label: 'Place Order', done: false },
  ];

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const orderRes = await apiPost('/order', {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          note: form.note.trim(),
        },
        paymentMethod,
      });

      const orderId = orderRes.data._id;

      // Step 2: Handle payment
      if (paymentMethod === 'COD') {
        // Refresh cart (backend cleared it)
        if (refetch) await refetch();
        navigate(`/payment/success?order=${orderId}`);
        return;
      }

      if (paymentMethod === 'Khalti') {
        const payRes = await paymentApi.initiateKhalti(orderId);
        if (refetch) await refetch();
        window.location.href = payRes.payment_url;
        return;
      }

      if (paymentMethod === 'eSewa') {
        const payRes = await paymentApi.initiateEsewa(orderId);
        if (refetch) await refetch();
        // eSewa returns HTML form — render & submit automatically
        const w = window.open('', '_self');
        w.document.write(payRes.form_html);
        w.document.close();
        return;
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        eyebrow="Secure Checkout"
        title="Checkout"
        subtitle="Complete your order — details stay saved if you go back."
        breadcrumb={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
      >
        {/* Progress stepper */}
        <ol className="mt-6 flex flex-wrap items-center gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-center gap-2 sm:gap-4">
              <span className={`inline-flex items-center gap-2 text-sm font-semibold ${
                step.done ? 'text-primary-600' : 'text-text-muted'
              }`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  step.done
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-light border border-border-light text-text-muted'
                }`}>
                  {step.done ? <Check className="w-4 h-4" /> : index + 1}
                </span>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <span className="hidden sm:block w-8 h-px bg-border-strong" />
              )}
            </li>
          ))}
        </ol>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ─── LEFT: Shipping + Payment ─── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Address */}
              <div className="bg-surface-light rounded-2xl border border-border-light p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" /> Shipping Address
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text" name="fullName" value={form.fullName} onChange={handleChange}
                        placeholder="Ram Bahadur"
                        className="w-full pl-10 pr-3 py-2.5 border-2 border-border rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="tel" name="phone" value={form.phone} onChange={handleChange}
                        placeholder="98XXXXXXXX"
                        className="w-full pl-10 pr-3 py-2.5 border-2 border-border rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Street Address *</label>
                    <input
                      type="text" name="address" value={form.address} onChange={handleChange}
                      placeholder="House no, street, area"
                      className="w-full px-3 py-2.5 border-2 border-border rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">City *</label>
                    <input
                      type="text" name="city" value={form.city} onChange={handleChange}
                      placeholder="Kathmandu"
                      className="w-full px-3 py-2.5 border-2 border-border rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Delivery Note (optional)</label>
                    <textarea
                      name="note" value={form.note} onChange={handleChange}
                      rows={2} placeholder="Landmark, preferred time, etc."
                      className="w-full px-3 py-2.5 border-2 border-border rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-surface-light rounded-2xl border border-border-light p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" /> Payment Method
                </h2>

                <div className="grid md:grid-cols-3 gap-3">
                  {settings.codEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-border hover:border-primary-300'
                      }`}
                    >
                      <Banknote className="w-6 h-6 mb-2 text-primary-500" />
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-xs text-text-muted">Pay when it arrives</p>
                    </button>
                  )}

                  {settings.khaltiEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Khalti')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'Khalti'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-border hover:border-primary-300'
                      }`}
                    >
                      <Wallet className="w-6 h-6 mb-2 text-primary-500" />
                      <p className="font-semibold">Khalti</p>
                      <p className="text-xs text-text-muted">Pay via Khalti wallet</p>
                    </button>
                  )}

                  {settings.esewaEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('eSewa')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'eSewa'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-border hover:border-primary-300'
                      }`}
                    >
                      <Wallet className="w-6 h-6 mb-2 text-primary-500" />
                      <p className="font-semibold">eSewa</p>
                      <p className="text-xs text-text-muted">Pay via eSewa wallet</p>
                    </button>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 p-4 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* ─── RIGHT: Order Summary ─── */}
            <div className="lg:col-span-1">
              <div className="bg-surface-light rounded-2xl border border-border-light p-6 sticky top-28 lg:top-36">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" /> Order Summary
                </h2>

                {/* Items */}
                <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                  {items.map((item) => {
                    const p = item.product;
                    if (!p) return null;
                    return (
                      <div key={p._id} className="flex gap-3 text-sm">
                        <div className="w-12 h-14 rounded-lg overflow-hidden bg-background-muted flex-shrink-0">
                          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-text-muted text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(p.price * item.quantity, settings.currency)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border-light pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Subtotal ({cartCount})</span>
                    <span className="font-medium">{formatCurrency(cartTotal, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-success-600 font-medium' : 'font-medium'}>
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost, settings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border-light pt-3 text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary-600">{formatCurrency(orderTotal, settings.currency)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-text-muted text-center mt-3">
                  By placing this order you agree to our terms
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
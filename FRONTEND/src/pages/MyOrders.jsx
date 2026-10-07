import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Package, PackageOpen, Truck, MapPin, CreditCard } from 'lucide-react';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

const STATUS_STYLES = {
  pending: 'bg-warning-100 text-warning-700',
  processing: 'bg-primary-100 text-primary-700',
  shipped: 'bg-accent-100 text-accent-700',
  delivered: 'bg-success-100 text-success-700',
  cancelled: 'bg-danger-100 text-danger-700',
};

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const MyOrders = () => {
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;
    apiGet('/order/my')
      .then((res) => setOrders(res.data || []))
      .catch(() => setError('Failed to load your orders. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, isAuthLoading]);

  if (!isAuthLoading && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="My Orders"
        subtitle="Track deliveries, review past purchases and reorder in one tap."
        breadcrumb={[{ label: 'My Orders' }]}
      />

      <Container className="py-10 lg:py-14">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-light rounded-2xl border border-border-light p-6 animate-pulse">
                <div className="h-4 w-40 bg-background-muted rounded mb-4" />
                <div className="h-16 w-full bg-background-muted rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-danger-500 py-16">{error}</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <PackageOpen className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No orders yet</h2>
            <p className="text-text-secondary text-sm mb-6">
              When you place an order, it will show up here with live tracking and details.
            </p>
            <Button to="/shop" variant="solid" size="md">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order._id} className="bg-surface-light rounded-2xl border border-border-light shadow-[0_1px_2px_rgba(23,23,23,0.04)] overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 lg:px-6 py-4 border-b border-border-light bg-background-muted/50">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-text-muted">
                      Order{' '}
                      <span className="font-mono font-semibold text-text-primary">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </span>
                    </span>
                    <span className="text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        STATUS_STYLES[order.orderStatus] || STATUS_STYLES.pending
                      }`}
                    >
                      {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                    </span>
                    {order.paymentStatus === 'paid' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success-100 text-success-700">
                        Paid
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-extrabold text-primary-600">
                    {formatCurrency(order.totalAmount, settings.currency)}
                  </span>
                </div>

                <div className="px-5 lg:px-6 py-5">
                  <ul className="space-y-3">
                    {(order.items || []).map((item, index) => (
                      <li key={index} className="flex items-center gap-4">
                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-background-muted shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-border-strong" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                          <p className="text-xs text-text-muted">
                            Qty {item.quantity} · {formatCurrency(item.price, settings.currency)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                      <span className="capitalize">{order.paymentMethod} · {STATUS_LABELS[order.orderStatus] || order.orderStatus}</span>
                    </div>
                    {order.shippingAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                        <span>
                          {order.shippingAddress.fullName}, {order.shippingAddress.address},{' '}
                          {order.shippingAddress.city}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                      <span className="capitalize">
                        Payment: {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Link
                      to="/contact"
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Need help with this order? →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </>
  );
};

export default MyOrders;

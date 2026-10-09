import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Camera, CheckCircle2, Clock3, Package, Truck, UserRound } from 'lucide-react';
import { ApiError, apiGet } from '../api/client';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import ProductImage from '../components/ui/ProductImage';

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_STYLES = {
  pending: 'bg-warning-100 text-warning-700',
  processing: 'bg-primary-100 text-primary-700',
  shipped: 'bg-accent-100 text-accent-700',
  delivered: 'bg-success-100 text-success-700',
  cancelled: 'bg-danger-100 text-danger-700',
};

const Profile = () => {
  const location = useLocation();
  const { user, setUser, isAuthenticated, isAuthLoading } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const previewUrlRef = useRef('');
  const [isUploading, setIsUploading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;
    apiGet('/order/my')
      .then((response) => setOrders(response.data || []))
      .catch(() => setOrdersError('Unable to load your order and shipment summary. Please try again.'))
      .finally(() => setIsLoadingOrders(false));
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const statusCounts = useMemo(() => orders.reduce((counts, order) => {
    const status = order.orderStatus || 'pending';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {}), [orders]);

  if (!isAuthLoading && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    if (!selectedPhoto) {
      setProfileError('Choose a photo before uploading.');
      return;
    }
    if (!selectedPhoto.type.startsWith('image/')) {
      setProfileError('Choose a valid image file.');
      return;
    }
    if (selectedPhoto.size > 5 * 1024 * 1024) {
      setProfileError('Profile photos must be 5 MB or smaller.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', selectedPhoto);
    try {
      const response = await authApi.uploadAvatar(formData);
      setUser(response.data);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
      setPreviewUrl('');
      setSelectedPhoto(null);
      setProfileMessage('Your profile photo has been updated.');
    } catch (error) {
      setProfileError(error instanceof ApiError ? error.message : 'Could not upload your photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        subtitle="Manage your profile photo and keep track of your orders and shipments."
        breadcrumb={[{ label: 'Profile' }]}
      />
      <Container className="py-8 lg:py-12">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.5fr]">
          <section className="h-fit rounded-2xl border border-border-light bg-surface-light p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary-100 bg-primary-50">
                {previewUrl || user?.avatar ? (
                  <img src={previewUrl || user.avatar} alt={`${user?.name || 'Customer'} profile`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary-500">{initials}</div>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-text-primary">{user?.name}</h2>
              <p className="mt-1 text-sm text-text-muted">{user?.email}</p>
              {user?.phone && <p className="mt-1 text-sm text-text-muted">{user.phone}</p>}
            </div>

            <form onSubmit={handlePhotoUpload} className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-text-primary" htmlFor="profile-photo">Profile photo</label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                  previewUrlRef.current = file ? URL.createObjectURL(file) : '';
                  setPreviewUrl(previewUrlRef.current);
                  setSelectedPhoto(file);
                  setProfileError('');
                  setProfileMessage('');
                }}
                className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:font-medium file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-text-muted">Image file, up to 5 MB. Stored securely with Cloudinary.</p>
              {profileError && <p role="alert" className="text-sm text-danger-600">{profileError}</p>}
              {profileMessage && <p role="status" className="text-sm text-success-700">{profileMessage}</p>}
              <button
                type="submit"
                disabled={isUploading || !selectedPhoto}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload photo'}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Your activity</p>
                  <h2 className="mt-1 text-2xl font-bold text-text-primary">Orders & shipments</h2>
                </div>
                <Link to="/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-700">All orders</Link>
              </div>

              {isLoadingOrders ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-background-muted" />)}
                </div>
              ) : ordersError ? (
                <p role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">{ordersError}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Total orders', count: orders.length, icon: Package },
                    { label: 'Processing', count: (statusCounts.pending || 0) + (statusCounts.processing || 0), icon: Clock3 },
                    { label: 'In transit', count: statusCounts.shipped || 0, icon: Truck },
                    { label: 'Delivered', count: statusCounts.delivered || 0, icon: CheckCircle2 },
                  ].map(({ label, count, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm">
                      <Icon className="h-5 w-5 text-primary-500" />
                      <p className="mt-3 text-2xl font-bold text-text-primary">{count}</p>
                      <p className="text-xs text-text-muted">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isLoadingOrders && !ordersError && (
              <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-light shadow-sm">
                <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
                  <h3 className="font-bold text-text-primary">Recent shipments</h3>
                  <span className="text-xs text-text-muted">{orders.length} total</span>
                </div>
                {orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <UserRound className="mx-auto h-8 w-8 text-primary-300" />
                    <p className="mt-3 text-sm text-text-muted">Your orders and shipment updates will appear here.</p>
                    <Link to="/shop" className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline">Explore the shop</Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border-light">
                    {orders.slice(0, 5).map((order) => (
                      <li key={order._id} className="flex items-center gap-3 px-5 py-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background-muted">
                          <ProductImage src={order.items?.[0]?.image} alt={order.items?.[0]?.name || ''} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            Order #{String(order._id).slice(-8).toUpperCase()}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {' · '}{formatCurrency(order.totalAmount, settings.currency)}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.orderStatus] || STATUS_STYLES.pending}`}>
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus || 'Pending'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
      </Container>
    </>
  );
};

export default Profile;

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  Loader2,
  Mail,
  Package,
  Search,
  Trash2,
  TrendingUp,
  Users,
  UserRoundCheck,
  UserRoundMinus,
  Warehouse,
} from 'lucide-react';
import { apiGet, apiPut, apiDelete, ApiError } from '../../api/client';

const CATEGORY_COLORS = ['#B85C4A', '#D99A8B', '#E8C5BC', '#C97864', '#B89A7A', '#7A625B'];

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [subscriberError, setSubscriberError] = useState('');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState('all');
  const [busySubscriberId, setBusySubscriberId] = useState(null);

  useEffect(() => {
    Promise.all([apiGet('/dashboard'), apiGet('/analytics')])
      .then(([dashboardRes, analyticsRes]) => {
        const dashboardData = dashboardRes?.data || {};
        const analyticsData = analyticsRes?.data || {};

        setData({
          products: dashboardData.counts?.products ?? analyticsData.totals?.products ?? 0,
          users: dashboardData.counts?.users ?? analyticsData.totals?.users ?? 0,
          categories: dashboardData.counts?.categories ?? analyticsData.categoryDistribution?.length ?? 0,
          wishlistItems: dashboardData.counts?.wishlistItems ?? 0,
          productHealth: analyticsData.availabilityBreakdown || {
            InStock: 0,
            OutOfStock: 0,
            PreOrder: 0,
          },
          categoryDistribution: analyticsData.categoryDistribution || [],
          userGrowth: analyticsData.userGrowth || [],
        });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load report data.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    apiGet('/newsletter')
      .then((res) => setSubscribers(res.data || []))
      .catch((err) => {
        setSubscriberError(err instanceof ApiError ? err.message : 'Failed to load subscribers.');
      })
      .finally(() => setIsLoadingSubscribers(false));
  }, []);

  const filteredSubscribers = useMemo(() => subscribers.filter((subscriber) => {
    const matchesSearch = subscriber.email.toLowerCase().includes(subscriberSearch.trim().toLowerCase());
    const matchesStatus = subscriberStatusFilter === 'all' || subscriber.status === subscriberStatusFilter;
    return matchesSearch && matchesStatus;
  }), [subscribers, subscriberSearch, subscriberStatusFilter]);

  const handleSubscriberStatus = async (subscriber) => {
    const status = subscriber.status === 'active' ? 'unsubscribed' : 'active';
    setBusySubscriberId(subscriber._id);
    setSubscriberError('');
    try {
      const result = await apiPut(`/newsletter/${subscriber._id}`, { status });
      setSubscribers((current) => current.map((item) => item._id === subscriber._id ? result.data : item));
    } catch (err) {
      setSubscriberError(err instanceof ApiError ? err.message : 'Failed to update subscriber.');
    } finally {
      setBusySubscriberId(null);
    }
  };

  const handleDeleteSubscriber = async (subscriber) => {
    if (!window.confirm(`Permanently remove ${subscriber.email} from the newsletter list?`)) return;
    setBusySubscriberId(subscriber._id);
    setSubscriberError('');
    try {
      await apiDelete(`/newsletter/${subscriber._id}`);
      setSubscribers((current) => current.filter((item) => item._id !== subscriber._id));
    } catch (err) {
      setSubscriberError(err instanceof ApiError ? err.message : 'Failed to remove subscriber.');
    } finally {
      setBusySubscriberId(null);
    }
  };

  const exportSubscribers = () => {
    const csvCell = (value) => {
      const safeValue = /^[=+\-@]/.test(String(value)) ? `'${value}` : String(value);
      return `"${safeValue.replaceAll('"', '""')}"`;
    };
    const rows = [
      ['Email', 'Status', 'Subscribed date'],
      ...filteredSubscribers.map((subscriber) => [
        subscriber.email,
        subscriber.status,
        new Date(subscriber.subscribedAt || subscriber.createdAt).toISOString(),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mesh-newsletter-subscribers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const metrics = useMemo(() => {
    if (!data) return [];

    const totalInventory = Object.values(data.productHealth).reduce((sum, value) => sum + value, 0) || 1;
    const inStock = data.productHealth.InStock || 0;
    const topCategory = data.categoryDistribution[0] || null;
    const strongestMonth = data.userGrowth.reduce(
      (max, item) => (item.count > max.count ? item : max),
      { label: 'N/A', count: 0 }
    );

    return [
      {
        title: 'Total Products',
        value: data.products.toLocaleString(),
        subtitle: `${Math.round((inStock / totalInventory) * 100)}% available`,
        icon: Package,
        accent: 'from-primary-500 to-primary-700',
      },
      {
        title: 'Registered Users',
        value: data.users.toLocaleString(),
        subtitle: strongestMonth.label !== 'N/A' ? `Peak: ${strongestMonth.label}` : 'No user data yet',
        icon: Users,
        accent: 'from-accent-500 to-accent-700',
      },
      {
        title: 'Categories',
        value: data.categories.toLocaleString(),
        subtitle: topCategory ? `Top: ${topCategory.name}` : 'No categories yet',
        icon: BarChart3,
        accent: 'from-primary-500 to-primary-600',
      },
      {
        title: 'Wishlist Items',
        value: data.wishlistItems.toLocaleString(),
        subtitle: 'Customer engagement',
        icon: TrendingUp,
        accent: 'from-primary-300 to-primary-500',
      },
    ];
  }, [data]);

  const totalInventory = data
    ? Object.values(data.productHealth).reduce((sum, value) => sum + value, 0) || 1
    : 1;

  const maxGrowth = data && data.userGrowth.length ? Math.max(...data.userGrowth.map((item) => item.count), 1) : 1;
  const topCategory = data?.categoryDistribution?.[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-muted mt-1">Store performance overview and product insights</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light bg-surface-light text-text-primary hover:bg-background-muted transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger-500" />
          <p className="text-danger-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {metrics.map(({ title, value, subtitle, icon: Icon, accent }) => (
              <div key={title} className="bg-surface-light rounded-xl shadow-sm border border-border-light p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-text-muted">{title}</p>
                    <p className="text-2xl font-bold text-text-primary mt-2">{value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${accent} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-4">{subtitle}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Inventory health</h2>
                </div>
                <span className="text-sm text-text-muted">
                  {Math.round(((data.productHealth.InStock || 0) / totalInventory) * 100)}% in stock
                </span>
              </div>

              <div className="p-6 space-y-4">
                {Object.entries(data.productHealth).map(([status, count]) => {
                  const width = totalInventory ? (count / totalInventory) * 100 : 0;
                  const statusColor =
                    status === 'InStock' ? '#6F8767' : status === 'PreOrder' ? '#B89A7A' : '#B85C4A';

                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-text-muted">{status}</span>
                        <span className="font-medium text-text-primary">{count}</span>
                      </div>
                      <div className="w-full bg-background-muted rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${width}%`, backgroundColor: statusColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="flex items-center gap-2 p-6 border-b border-border-light">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-text-primary">Monthly registrations</h2>
              </div>

              <div className="p-6 space-y-4">
                {data.userGrowth.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No registration data available</p>
                ) : (
                  data.userGrowth.map(({ label, count }) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">{label}</span>
                        <span className="font-medium text-text-primary">{count} users</span>
                      </div>
                      <div className="w-full bg-background-muted rounded-full h-2.5">
                        <div
                          className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxGrowth) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light overflow-hidden">
              <div className="p-6 border-b border-border-light">
                <h2 className="text-lg font-semibold text-text-primary">Category breakdown</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-background-muted text-text-muted text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Products</th>
                      <th className="px-6 py-3">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categoryDistribution.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-text-muted">
                          No category data yet
                        </td>
                      </tr>
                    ) : (
                      data.categoryDistribution.map(({ name, count, percentage }, index) => (
                        <tr key={name} className="border-t border-border-light">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                              />
                              <span className="font-medium text-text-primary">{name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-primary">{count}</td>
                          <td className="px-6 py-4 text-text-primary">{percentage}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="p-6 border-b border-border-light">
                <h2 className="text-lg font-semibold text-text-primary">Key insights</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-background-muted p-4">
                  <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Inventory status</p>
                    <p className="text-sm text-text-muted">
                      {Math.round(((data.productHealth.InStock || 0) / totalInventory) * 100)}% of your products are currently in stock.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-background-muted p-4">
                  <TrendingUp className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Growth trend</p>
                    <p className="text-sm text-text-muted">
                      {topCategory
                        ? `${topCategory.name} leads with ${topCategory.percentage}% of total catalog share.`
                        : 'No category growth data is available yet.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-background-muted p-4">
                  <Users className="w-5 h-5 text-accent-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Customer activity</p>
                    <p className="text-sm text-text-muted">
                      {data.userGrowth.length
                        ? `${data.userGrowth[data.userGrowth.length - 1].count} customers joined in the latest recorded period.`
                        : 'Customer registration data will appear here once users sign up.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <section className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border-light p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Mail className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Newsletter subscribers</h2>
              <p className="mt-1 text-sm text-text-muted">Email addresses collected from the store newsletter form</p>
            </div>
          </div>
          {!isLoadingSubscribers && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-background-muted px-3 py-1 text-xs font-semibold text-text-primary">
                {subscribers.length.toLocaleString()} total
              </span>
              <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
                {subscribers.filter((subscriber) => subscriber.status === 'active').length.toLocaleString()} active
              </span>
              <button
                type="button"
                onClick={exportSubscribers}
                disabled={filteredSubscribers.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-border-light px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-background-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {!isLoadingSubscribers && !subscriberError && (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={subscriberSearch}
                  onChange={(event) => setSubscriberSearch(event.target.value)}
                  placeholder="Search subscriber emails"
                  className="w-full rounded-lg border border-border-light bg-surface-light py-2 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <select
                value={subscriberStatusFilter}
                onChange={(event) => setSubscriberStatusFilter(event.target.value)}
                aria-label="Filter newsletter subscribers by status"
                className="rounded-lg border border-border-light bg-surface-light px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-400"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          )}

          {subscriberError && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-danger-500" />
              <p className="text-sm text-danger-600">{subscriberError}</p>
            </div>
          )}

          {isLoadingSubscribers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : subscriberError && subscribers.length === 0 ? null : subscribers.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No newsletter subscribers yet.</p>
          ) : filteredSubscribers.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No subscribers match your search or filter.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-background-muted text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Subscribed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="border-t border-border-light">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">{subscriber.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          subscriber.status === 'active'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-background-muted text-text-muted'
                        }`}>
                          {subscriber.status === 'active' ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-muted">
                        {new Date(subscriber.subscribedAt || subscriber.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSubscriberStatus(subscriber)}
                            disabled={busySubscriberId === subscriber._id}
                            aria-label={`${subscriber.status === 'active' ? 'Unsubscribe' : 'Reactivate'} ${subscriber.email}`}
                            title={subscriber.status === 'active' ? 'Unsubscribe' : 'Reactivate'}
                            className="rounded-lg p-2 text-text-muted transition hover:bg-background-muted hover:text-primary-600 disabled:opacity-50"
                          >
                            {subscriber.status === 'active'
                              ? <UserRoundMinus className="h-4 w-4" />
                              : <UserRoundCheck className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(subscriber)}
                            disabled={busySubscriberId === subscriber._id}
                            aria-label={`Remove ${subscriber.email}`}
                            title="Remove subscriber"
                            className="rounded-lg p-2 text-text-muted transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminReports;

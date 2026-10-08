import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  Loader2,
  Package,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react';
import { apiGet, ApiError } from '../../api/client';

const CATEGORY_COLORS = ['#B85C4A', '#D99A8B', '#E8C5BC', '#C97864', '#B89A7A', '#7A625B'];

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    </div>
  );
};

export default AdminReports;

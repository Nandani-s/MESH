// pages/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, ShoppingCart, Package,
  Users, ArrowUp, Loader2, AlertCircle, BarChart3
} from 'lucide-react';
import { apiGet, ApiError } from '../../api/client';

const CATEGORY_COLORS = ['#6366f1','#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6'];
const AVAILABILITY_COLORS = { InStock: '#10b981', OutOfStock: '#ef4444', PreOrder: '#f59e0b' };

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/analytics')
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  const maxGrowth = data ? Math.max(...data.userGrowth.map(m => m.count), 1) : 1;
  const totalAvailability = data
    ? Object.values(data.availabilityBreakdown).reduce((s, v) => s + v, 0) || 1
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted mt-1">Track your store performance and insights</p>
        </div>
        <div className="flex bg-background-muted rounded-lg p-1">
          {['daily','weekly','monthly'].map((r) => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition capitalize ${
                timeRange === r ? 'bg-primary-500 text-white' : 'text-text-muted hover:text-text-primary'
              }`}>{r}</button>
          ))}
        </div>
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
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Real metrics */}
            {[
              { title: 'Total Products', value: data.totals.products.toLocaleString(), icon: Package, color: 'from-purple-500 to-purple-600', real: true },
              { title: 'Total Users', value: data.totals.users.toLocaleString(), icon: Users, color: 'from-orange-500 to-orange-600', real: true },
              { title: 'Total Revenue', value: '—', icon: DollarSign, color: 'from-green-500 to-green-600', real: false },
              { title: 'Total Orders', value: '—', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', real: false },
            ].map(({ title, value, icon: Icon, color, real }) => (
              <div key={title} className={`bg-surface-light rounded-xl shadow-sm border border-border-light p-6 ${!real ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">{title}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
                    {!real && <p className="text-xs text-text-muted mt-1">Needs order system</p>}
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center shadow-lg ${!real ? 'grayscale' : ''}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Growth Chart */}
          <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
            <div className="p-6 border-b border-border-light flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-text-primary">User Registrations (Last 6 Months)</h2>
            </div>
            <div className="p-6">
              {data.userGrowth.every(m => m.count === 0) ? (
                <p className="text-text-muted text-center py-8">No user registrations in the last 6 months</p>
              ) : (
                <div className="space-y-3">
                  {data.userGrowth.map(({ label, count }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted w-16">{label}</span>
                        <span className="text-text-primary font-medium">{count} users</span>
                      </div>
                      <div className="w-full bg-background-muted rounded-full h-2.5">
                        <div
                          className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxGrowth) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category + Availability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="p-6 border-b border-border-light">
                <h2 className="text-lg font-semibold text-text-primary">Products by Category</h2>
              </div>
              <div className="p-6 space-y-4">
                {data.categoryDistribution.length === 0 ? (
                  <p className="text-text-muted text-center py-4">No products yet</p>
                ) : data.categoryDistribution.map(({ name, count, percentage }, i) => (
                  <div key={name}>
                    <div className="flex justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        <p className="font-medium text-text-primary text-sm">{name}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-text-primary text-sm">{count} products</span>
                        <span className="text-text-muted text-xs ml-2">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-muted rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Breakdown */}
            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
              <div className="p-6 border-b border-border-light">
                <h2 className="text-lg font-semibold text-text-primary">Product Availability</h2>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(data.availabilityBreakdown).map(([status, count]) => {
                  const pct = Math.round((count / totalAvailability) * 100);
                  const labels = { InStock: 'In Stock', OutOfStock: 'Out of Stock', PreOrder: 'Pre-Order' };
                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: AVAILABILITY_COLORS[status] }} />
                          <p className="font-medium text-text-primary text-sm">{labels[status] || status}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-text-primary text-sm">{count} products</span>
                          <span className="text-text-muted text-xs ml-2">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-background-muted rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: AVAILABILITY_COLORS[status] }} />
                      </div>
                    </div>
                  );
                })}
                {/* Combined bar */}
                <div className="w-full bg-background-muted rounded-full h-3 flex overflow-hidden mt-2">
                  {Object.entries(data.availabilityBreakdown).map(([status, count]) => (
                    <div key={status} className="h-3 transition-all duration-500"
                      style={{
                        width: `${Math.round((count / totalAvailability) * 100)}%`,
                        backgroundColor: AVAILABILITY_COLORS[status]
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-50">
            {[
              { title: 'Traffic Sources', desc: 'Requires Google Analytics or similar tracking integration' },
              { title: 'Device Statistics', desc: 'Requires browser analytics tracking integration' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-surface-light rounded-xl shadow-sm border border-border-light border-dashed">
                <div className="p-6 border-b border-border-light">
                  <h2 className="text-lg font-semibold text-text-muted">{title}</h2>
                </div>
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="w-10 h-10 text-border mb-3" />
                  <p className="text-sm text-text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;

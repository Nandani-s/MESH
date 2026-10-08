// pages/admin/AdminAnalytics.jsx
import { useState, useEffect } from 'react';
import {
  DollarSign, ShoppingCart, Package,
  Users, Loader2, AlertCircle, BarChart3
} from 'lucide-react';
import { apiGet, ApiError } from '../../api/client';

const CATEGORY_COLORS = ['#B85C4A', '#D99A8B', '#E8C5BC', '#C97864', '#B89A7A', '#7A625B'];
const AVAILABILITY_COLORS = { InStock: '#6F8767', OutOfStock: '#B85C4A', PreOrder: '#B89A7A' };

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/analytics')
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  const maxGrowth = data ? Math.max(...data.userGrowth.map((m) => m.count), 1) : 1;
  const totalAvailability = data
    ? Object.values(data.availabilityBreakdown).reduce((s, v) => s + v, 0) || 1
    : 1;

    const lineChartPoints = data?.userGrowth?.length
      ? data.userGrowth.map((point, index) => ({
          ...point,
          x: data.userGrowth.length === 1 ? 312 : 55 + (index * 515) / (data.userGrowth.length - 1),
          y: 210 - (point.count / maxGrowth) * 160,
        }))
      : [];

    const totalCategoryProducts = data?.categoryDistribution?.reduce((total, item) => total + item.count, 0) || 0;
    const pieSegments = totalCategoryProducts
      ? data.categoryDistribution.reduce((segments, item, index) => {
          const startAngle = segments.length
            ? segments[segments.length - 1].endAngle
            : 0;
          const percentage = (item.count / totalCategoryProducts) * 100;
          const endAngle = startAngle + (percentage / 100) * 360;
          const radius = 70;
          const cx = 100;
          const cy = 100;
          const start = {
            x: cx + radius * Math.cos((Math.PI * (startAngle - 90)) / 180),
            y: cy + radius * Math.sin((Math.PI * (startAngle - 90)) / 180),
          };
          const end = {
            x: cx + radius * Math.cos((Math.PI * (endAngle - 90)) / 180),
            y: cy + radius * Math.sin((Math.PI * (endAngle - 90)) / 180),
          };
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

          return [
            ...segments,
            {
              ...item,
              percentage: Math.round(percentage),
              color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
              startAngle,
              endAngle,
              fullCircle: endAngle - startAngle >= 359.999,
              path: `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`,
            },
          ];
        }, [])
      : [];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
            <p className="text-text-muted mt-1">Track your store performance and insights</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
            Last 6 months
          </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Products', value: data.totals.products.toLocaleString(), icon: Package, color: 'from-primary-500 to-primary-700', real: true },
                { title: 'Total Users', value: data.totals.users.toLocaleString(), icon: Users, color: 'from-accent-500 to-accent-700', real: true },
                { title: 'Total Revenue', value: '—', icon: DollarSign, color: 'from-primary-300 to-primary-500', real: false },
                { title: 'Total Orders', value: '—', icon: ShoppingCart, color: 'from-primary-500 to-primary-600', real: false },
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-surface-light rounded-xl shadow-sm border border-border-light overflow-hidden">
                <div className="flex flex-col gap-2 border-b border-border-light p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-500" />
                    <h2 className="text-lg font-semibold text-text-primary">User Registrations</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted" aria-label="Chart legend">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #B85C4A, #B89A7A)' }}
                    />
                    Monthly registrations
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {data.userGrowth.every((m) => m.count === 0) ? (
                    <p className="text-text-muted text-center py-8">No user registrations in the last 6 months</p>
                  ) : (
                    <div className="w-full">
                      <svg
                        viewBox="0 0 600 270"
                        role="img"
                        aria-label="Line chart showing user registrations for the last six months"
                        className="h-auto w-full overflow-visible"
                      >
                        <defs>
                          <linearGradient id="registrationArea" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#B85C4A" stopOpacity="0.24" />
                            <stop offset="100%" stopColor="#B85C4A" stopOpacity="0.02" />
                          </linearGradient>
                          <linearGradient id="registrationLine" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#B85C4A" />
                            <stop offset="100%" stopColor="#C97864" />
                          </linearGradient>
                        </defs>
                        {[0, 25, 50, 75, 100].map((pct) => {
                          const y = 210 - (pct / 100) * 160;
                          const value = Math.round((pct / 100) * maxGrowth);
                          return (
                            <g key={pct}>
                              <line
                                x1="48"
                                x2="580"
                                y1={y}
                                y2={y}
                                stroke="#F1E4E1"
                                strokeDasharray="4 6"
                              />
                              <text x="38" y={y + 4} textAnchor="end" fontSize="11" fill="#7A625B">
                                {value}
                              </text>
                            </g>
                          );
                        })}

                        {lineChartPoints.length > 1 && (
                          <path
                            d={`M ${lineChartPoints[0].x} 210 ${lineChartPoints
                              .map((point) => `L ${point.x} ${point.y}`)
                              .join(' ')} L ${lineChartPoints[lineChartPoints.length - 1].x} 210 Z`}
                            fill="url(#registrationArea)"
                          />
                        )}

                        {lineChartPoints.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="url(#registrationLine)"
                            strokeWidth="4"
                            points={lineChartPoints.map(({ x, y }) => `${x},${y}`).join(' ')}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        )}

                        {lineChartPoints.map(({ label, count, x, y }) => (
                          <g key={label} className="group">
                            <circle cx={x} cy={y} r="11" fill="#B85C4A" opacity="0.14" />
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#FFFDFC"
                              stroke="#B85C4A"
                              strokeWidth="3"
                              tabIndex="0"
                              aria-label={`${label}: ${count} registrations`}
                              className="cursor-pointer outline-none focus-visible:stroke-[4]"
                            >
                              <title>{`${label}: ${count} ${count === 1 ? 'registration' : 'registrations'}`}</title>
                            </circle>
                            <text x={x} y="242" textAnchor="middle" fontSize="11" fill="#7A625B">
                              {label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-light rounded-xl shadow-sm border border-border-light overflow-hidden">
                <div className="p-6 border-b border-border-light">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">Category Mix</h2>
                    <p className="mt-1 text-xs text-text-muted">Top categories by product count</p>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {pieSegments.length === 0 ? (
                    <p className="text-text-muted text-center py-8">No category data yet</p>
                  ) : (
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
                      <svg
                        viewBox="0 0 200 200"
                        role="img"
                        aria-label="Pie chart showing product distribution across top categories"
                        className="h-auto w-full max-w-[220px] shrink-0"
                      >
                        {pieSegments.map((segment) => (
                          segment.fullCircle ? (
                            <circle
                              key={segment.name}
                              cx="100"
                              cy="100"
                              r="70"
                              fill={segment.color}
                              stroke="#FFFDFC"
                              strokeWidth="2"
                              tabIndex="0"
                              aria-label={`${segment.name}: ${segment.count} products, 100%`}
                            >
                              <title>{`${segment.name}: ${segment.count} products (100%)`}</title>
                            </circle>
                          ) : (
                            <path
                              key={segment.name}
                              d={segment.path}
                              fill={segment.color}
                              stroke="#FFFDFC"
                              strokeWidth="2"
                              tabIndex="0"
                              aria-label={`${segment.name}: ${segment.count} products, ${segment.percentage}%`}
                            >
                              <title>{`${segment.name}: ${segment.count} products (${segment.percentage}%)`}</title>
                            </path>
                          )
                        ))}
                        <circle cx="100" cy="100" r="32" fill="#FFFDFC" />
                        <text x="100" y="98" textAnchor="middle" fontSize="18" fontWeight="700" fill="#3B2925">
                          {totalCategoryProducts.toLocaleString()}
                        </text>
                        <text x="100" y="116" textAnchor="middle" fontSize="10" fill="#7A625B">
                          shown
                        </text>
                      </svg>

                      <div className="grid w-full flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1" aria-label="Category chart legend">
                        {pieSegments.map(({ name, count, percentage, color }) => (
                          <div key={name} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-background-muted/60 px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm text-text-primary truncate">{name}</span>
                            </div>
                            <div className="text-right text-sm text-text-muted">
                              <span className="font-medium text-text-primary">{count}</span> · {percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  export default AdminAnalytics;

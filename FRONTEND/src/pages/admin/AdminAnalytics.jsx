// pages/admin/AdminAnalytics.jsx
import { useState, useEffect } from 'react';
import {
  DollarSign, ShoppingCart, Package,
  Users, Loader2, AlertCircle, BarChart3
} from 'lucide-react';
import { apiGet, ApiError } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';

const CATEGORY_COLORS = ['#B85C4A', '#D99A8B', '#E8C5BC', '#C97864', '#B89A7A', '#7A625B'];
const AVAILABILITY_COLORS = { InStock: '#6F8767', OutOfStock: '#B85C4A', PreOrder: '#B89A7A' };
const CHART_COLORS = ['#B85C4A', '#D99A8B', '#B89A7A', '#7A8A70', '#7F9AA5', '#8A7899'];
const SEGMENT_COLORS = { New: '#D99A8B', Loyal: '#7A8A70', VIP: '#B85C4A', 'At risk': '#8A7899', Lost: '#7F9AA5' };

const ChartCard = ({ title, subtitle, children }) => (
  <section className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm">
    <div className="border-b border-border-light p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

const ChartEmpty = () => (
  <p className="py-12 text-center text-sm text-text-muted">No data available for this chart yet.</p>
);

const LineChart = ({ data, valueKey, formatValue }) => {
  const max = Math.max(...data.map((point) => point[valueKey]), 1);
  const points = data.map((point, index) => ({
    ...point,
    x: data.length === 1 ? 250 : 48 + (index * 420) / (data.length - 1),
    y: 210 - (point[valueKey] / max) * 160,
  }));

  return (
    <svg viewBox="0 0 500 260" role="img" aria-label="Monthly revenue line chart" className="h-auto w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((step) => {
        const y = 210 - step * 160;
        return (
          <g key={step}>
            <line x1="48" x2="480" y1={y} y2={y} stroke="#F1E4E1" strokeDasharray="4 6" />
            <text x="42" y={y + 4} textAnchor="end" fontSize="9" fill="#7A625B">
              {formatValue((step * max))}
            </text>
          </g>
        );
      })}
      <polyline
        points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
        fill="none"
        stroke="#B85C4A"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map(({ x, y, label, [valueKey]: value }) => (
        <g key={label}>
          <circle cx={x} cy={y} r="5" fill="#FFFDFC" stroke="#B85C4A" strokeWidth="3">
            <title>{`${label}: ${formatValue(value)}`}</title>
          </circle>
          <text x={x} y="238" textAnchor="middle" fontSize="10" fill="#7A625B">{label}</text>
        </g>
      ))}
    </svg>
  );
};

const DonutChart = ({ items, centerLabel }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const segments = items.map((item, index) => {
    const startAngle = total
      ? (items.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) / total) * 360
      : 0;
    const endAngle = startAngle + (total ? (item.value / total) * 360 : 0);
    const start = {
      x: 100 + 72 * Math.cos((Math.PI * (startAngle - 90)) / 180),
      y: 100 + 72 * Math.sin((Math.PI * (startAngle - 90)) / 180),
    };
    const end = {
      x: 100 + 72 * Math.cos((Math.PI * (endAngle - 90)) / 180),
      y: 100 + 72 * Math.sin((Math.PI * (endAngle - 90)) / 180),
    };
    return {
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
      fullCircle: endAngle - startAngle >= 359.999,
      path: `M 100 100 L ${start.x} ${start.y} A 72 72 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 200 200" role="img" aria-label="Donut chart showing customer segments" className="w-full max-w-[200px] shrink-0">
        {segments.map((segment) => segment.fullCircle ? (
          <circle key={segment.name} cx="100" cy="100" r="72" fill={segment.color} />
        ) : (
          <path key={segment.name} d={segment.path} fill={segment.color} />
        ))}
        <circle cx="100" cy="100" r="42" fill="#FFFDFC" />
        <text x="100" y="97" textAnchor="middle" fontSize="20" fontWeight="700" fill="#3B2925">{total.toLocaleString()}</text>
        <text x="100" y="115" textAnchor="middle" fontSize="9" fill="#7A625B">{centerLabel}</text>
      </svg>
      <div className="grid w-full grid-cols-2 gap-2" aria-label="Customer segment legend">
        {segments.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between gap-2 rounded-lg bg-background-muted/60 px-3 py-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate text-text-primary">{name}</span>
            </span>
            <span className="font-semibold text-text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScatterChart = ({ points, formatValue }) => {
  const maxFrequency = Math.max(...points.map((point) => point.frequency), 1);
  const maxSpend = Math.max(...points.map((point) => point.spend), 1);
  return (
    <svg viewBox="0 0 500 280" role="img" aria-label="Scatter plot of order frequency and customer spend" className="h-auto w-full">
      <line x1="52" y1="225" x2="480" y2="225" stroke="#BFA9A3" />
      <line x1="52" y1="30" x2="52" y2="225" stroke="#BFA9A3" />
      <text x="265" y="265" textAnchor="middle" fontSize="11" fill="#7A625B">Orders per customer</text>
      <text x="14" y="130" textAnchor="middle" fontSize="11" fill="#7A625B" transform="rotate(-90 14 130)">Lifetime spend</text>
      {points.map((point) => {
        const x = 58 + (point.frequency / maxFrequency) * 405;
        const y = 218 - (point.spend / maxSpend) * 175;
        return (
          <circle key={point.label} cx={x} cy={y} r="5" fill={SEGMENT_COLORS[point.segment]} fillOpacity=".8">
            <title>{`${point.label} (${point.segment}): ${point.frequency} orders, ${formatValue(point.spend)}`}</title>
          </circle>
        );
      })}
    </svg>
  );
};

const HeatmapChart = ({ matrix }) => {
  const max = Math.max(...matrix.flat(), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="overflow-x-auto">
      <div role="img" aria-label="Heatmap of order activity by weekday and Nepal time hour" className="min-w-[540px]">
        <div className="mb-2 grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-1">
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span key={hour} className="text-center text-[8px] text-text-muted">{hour % 3 === 0 ? hour : ''}</span>
          ))}
        </div>
        {matrix.map((hours, dayIndex) => (
          <div key={days[dayIndex]} className="mb-1 grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] items-center gap-1">
            <span className="text-[10px] text-text-muted">{days[dayIndex]}</span>
            {hours.map((count, hour) => (
              <span
                key={hour}
                title={`${days[dayIndex]} ${hour}:00 — ${count} orders`}
                className="aspect-square rounded-[2px]"
                style={{ backgroundColor: count ? `rgba(184, 92, 74, ${0.15 + (count / max) * 0.85})` : '#F1E4E1' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const FunnelChart = ({ stages }) => {
  const max = Math.max(...stages.map((stage) => stage.visitors), 1);
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const width = Math.max((stage.visitors / max) * 100, stage.visitors ? 12 : 0);
        return (
          <div key={stage.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-text-secondary">{stage.name}</span>
            <div className="h-8 flex-1 rounded-r-lg bg-background-muted">
              <div
                className="flex h-full items-center justify-between rounded-r-lg px-2 text-xs font-semibold text-white transition-all"
                style={{ width: `${width}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length], minWidth: stage.visitors ? '4rem' : 0 }}
              >
                {stage.visitors > 0 && <><span>{stage.visitors}</span><span>{stage.conversionRate}%</span></>}
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-right text-[10px] text-text-muted">Conversion from previous step</p>
    </div>
  );
};

const StackedBarChart = ({ months, colors, formatValue }) => {
  const categories = [...new Set(months.flatMap((month) => Object.keys(month.categories)))];
  const totals = months.map((month) => Object.values(month.categories).reduce((sum, value) => sum + value, 0));
  const max = Math.max(...totals, 1);
  return (
    <div>
      <svg viewBox="0 0 540 250" role="img" aria-label="Stacked bar chart of monthly sales by product category" className="h-auto w-full">
        {[0, 0.5, 1].map((step) => {
          const y = 195 - step * 155;
          return <line key={step} x1="38" x2="525" y1={y} y2={y} stroke="#F1E4E1" strokeDasharray="4 6" />;
        })}
        {months.map((month, monthIndex) => {
          const x = 55 + monthIndex * 78;
          let height = 0;
          return (
            <g key={month.label}>
              {categories.map((category, categoryIndex) => {
                const value = month.categories[category] || 0;
                const segmentHeight = (value / max) * 155;
                const y = 195 - height - segmentHeight;
                height += segmentHeight;
                return value ? (
                  <rect key={category} x={x} y={y} width="38" height={segmentHeight} fill={colors[categoryIndex % colors.length]}>
                    <title>{`${month.label} ${category}: ${formatValue(value)}`}</title>
                  </rect>
                ) : null;
              })}
              <text x={x + 19} y="215" textAnchor="middle" fontSize="10" fill="#7A625B">{month.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {categories.map((category, index) => (
          <span key={category} className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
            {category}
          </span>
        ))}
      </div>
    </div>
  );
};

const BubbleChart = ({ points, formatValue }) => {
  const maxPrice = Math.max(...points.map((point) => point.price), 1);
  const maxQuantity = Math.max(...points.map((point) => point.quantity), 1);
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
  return (
    <svg viewBox="0 0 500 280" role="img" aria-label="Bubble chart of average product price, units sold, and revenue" className="h-auto w-full">
      <line x1="52" y1="225" x2="480" y2="225" stroke="#BFA9A3" />
      <line x1="52" y1="30" x2="52" y2="225" stroke="#BFA9A3" />
      <text x="265" y="265" textAnchor="middle" fontSize="11" fill="#7A625B">Average selling price</text>
      <text x="14" y="130" textAnchor="middle" fontSize="11" fill="#7A625B" transform="rotate(-90 14 130)">Units sold</text>
      {points.map((point, index) => {
        const x = 58 + (point.price / maxPrice) * 405;
        const y = 218 - (point.quantity / maxQuantity) * 175;
        const radius = 5 + (point.revenue / maxRevenue) * 13;
        return (
          <circle key={point.name} cx={x} cy={y} r={radius} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity=".65">
            <title>{`${point.name}: ${formatValue(point.price)} average, ${point.quantity} units, ${formatValue(point.revenue)} revenue`}</title>
          </circle>
        );
      })}
    </svg>
  );
};

const AdminAnalytics = () => {
  const { settings } = useSettings();
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
                { title: 'Total Revenue', value: formatCurrency(data.totals.revenue, settings.currency), icon: DollarSign, color: 'from-primary-300 to-primary-500', real: true },
                { title: 'Total Orders', value: data.totals.orders.toLocaleString(), icon: ShoppingCart, color: 'from-primary-500 to-primary-600', real: true },
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
              <ChartCard title="Top-selling products" subtitle="Units sold in the last 6 months">
                {data.topProducts.length === 0 ? <ChartEmpty /> : (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => {
                      const max = Math.max(...data.topProducts.map((item) => item.quantity), 1);
                      return (
                        <div key={product.name}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="truncate font-medium text-text-primary">{product.name}</span>
                            <span className="shrink-0 text-text-muted">{product.quantity} sold</span>
                          </div>
                          <div className="h-2 rounded-full bg-background-muted">
                            <div className="h-2 rounded-full" style={{ width: `${(product.quantity / max) * 100}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ChartCard>

              <ChartCard title="Revenue trend" subtitle="Monthly order revenue in the last 6 months">
                {data.monthlyRevenue.every((month) => month.revenue === 0) ? <ChartEmpty /> : (
                  <LineChart data={data.monthlyRevenue} valueKey="revenue" formatValue={(value) => formatCurrency(value, settings.currency)} />
                )}
              </ChartCard>

              <ChartCard title="Customer segments" subtitle="Purchasers grouped by purchase history">
                <DonutChart
                  items={data.customerSegments.map(({ name, customers }) => ({ name, value: customers }))}
                  centerLabel="Customers"
                />
                <p className="mt-3 text-xs text-text-muted">VIP: 5+ orders or Rs 50,000+ spend · At risk: 91-180 days since order · Lost: 181+ days since order</p>
              </ChartCard>

              <ChartCard title="Customer purchase patterns" subtitle="Purchase frequency vs. lifetime spend">
                {data.spendingCustomers.length === 0 ? <ChartEmpty /> : (
                  <>
                    <ScatterChart points={data.spendingCustomers} formatValue={(value) => formatCurrency(value, settings.currency)} />
                    <div className="mt-2 flex flex-wrap gap-4">
                      {Object.entries(SEGMENT_COLORS).map(([segment, color]) => (
                        <span key={segment} className="flex items-center gap-1.5 text-[10px] text-text-muted">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                          {segment}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </ChartCard>

              <ChartCard title="Purchase activity" subtitle="Order count by Nepal time, weekday and hour">
                <HeatmapChart matrix={data.purchaseHeatmap} />
              </ChartCard>

              <ChartCard title="Shopping funnel" subtitle="Visitors progressing through the purchase journey">
                <FunnelChart stages={data.funnel} />
                <p className="mt-3 text-xs text-text-muted">Event-based tracking starts from the date this analytics update is deployed.</p>
              </ChartCard>

              <ChartCard title="Monthly sales by category" subtitle="Revenue stacked by product category">
                {data.monthlyCategorySales.every((month) => Object.values(month.categories).every((value) => value === 0))
                  ? <ChartEmpty />
                  : <StackedBarChart months={data.monthlyCategorySales} colors={CHART_COLORS} formatValue={(value) => formatCurrency(value, settings.currency)} />}
              </ChartCard>

              <ChartCard title="Product performance bubbles" subtitle="Average selling price vs. units sold; bubble size shows revenue">
                {data.productBubbles.length === 0 ? <ChartEmpty /> : <BubbleChart points={data.productBubbles} formatValue={(value) => formatCurrency(value, settings.currency)} />}
              </ChartCard>
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

import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { AnalyticsEvent } from "../models/analyticsEvent.js";

const FUNNEL_STAGES = [
  { type: "visit", name: "Store visits" },
  { type: "product_view", name: "Product views" },
  { type: "add_to_cart", name: "Added to cart" },
  { type: "checkout_started", name: "Checkout started" },
  { type: "purchase", name: "Purchases" },
];

const getNepalDayAndHour = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return { day: days.indexOf(values.weekday), hour: Number(values.hour) };
};

const getMonthlyLabels = (now) => {
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    months.push({
      key: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`,
      label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date),
    });
  }
  return months;
};

const getCustomerSegment = (customer, now) => {
  const daysSinceOrder = (now - customer.lastOrder) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > 180) return "Lost";
  if (daysSinceOrder > 90) return "At risk";
  if (customer.orders >= 5 || customer.spend >= 50000) return "VIP";
  if (customer.orders >= 2) return "Loyal";
  return "New";
};

const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const months = getMonthlyLabels(now);
    const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

    const [
      totalProducts,
      totalUsers,
      userGrowth,
      productsByCategory,
      productsByAvailability,
      orders,
      allCustomerOrders,
      analyticsEvents,
      productCategories,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),

      // Monthly user registrations for the last 6 months
      User.aggregate([
        { $match: { role: "user", createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Product count grouped by category
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Product count grouped by availability status
      Product.aggregate([
        { $group: { _id: "$availability", count: { $sum: 1 } } },
      ]),
      Order.find({ createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: "cancelled" } })
        .select("items user totalAmount orderStatus createdAt analyticsVisitorId")
        .lean(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        {
          $group: {
            _id: "$user",
            orders: { $sum: 1 },
            spend: { $sum: "$totalAmount" },
            lastOrder: { $max: "$createdAt" },
          },
        },
      ]),
      AnalyticsEvent.find({ createdAt: { $gte: sixMonthsAgo } })
        .select("visitorId type createdAt")
        .sort({ createdAt: 1 })
        .lean(),
      Product.find().select("name category").lean(),
    ]);

    const growthMap = {};
    userGrowth.forEach((g) => {
      const key = `${g._id.year}-${g._id.month}`;
      growthMap[key] = g.count;
    });

    const monthLabels = months.map(({ key, label }) => ({ label, count: growthMap[key] || 0 }));

    const totalForCategories = productsByCategory.reduce((s, c) => s + c.count, 0);
    const categoryData = productsByCategory.map((c) => ({
      name: c._id || 'Uncategorised',
      count: c.count,
      percentage: totalForCategories > 0 ? Math.round((c.count / totalForCategories) * 100) : 0,
    }));

    const availabilityMap = { InStock: 0, OutOfStock: 0, PreOrder: 0 };
    productsByAvailability.forEach((a) => {
      if (a._id in availabilityMap) availabilityMap[a._id] = a.count;
    });

    const [orderTotals] = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const monthlyRevenue = new Map(months.map(({ key, label }) => [key, { label, revenue: 0 }]));
    const salesByProduct = new Map();
    const weekdayHours = Array.from({ length: 7 }, () => Array(24).fill(0));

    for (const order of orders) {
      const monthKey = `${order.createdAt.getUTCFullYear()}-${order.createdAt.getUTCMonth() + 1}`;
      const monthlyData = monthlyRevenue.get(monthKey);
      if (monthlyData) monthlyData.revenue += order.totalAmount;

      const { day, hour } = getNepalDayAndHour(order.createdAt);
      weekdayHours[day][hour] += 1;

      for (const item of order.items) {
        const productId = item.product?.toString() || item.name;
        const product = salesByProduct.get(productId) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
        product.quantity += item.quantity;
        product.revenue += item.price * item.quantity;
        product.orders += 1;
        salesByProduct.set(productId, product);

      }
    }

    const productCategoryMap = new Map(productCategories.map((product) => [product._id.toString(), product.category]));
    const categoryTotals = new Map();
    const categorySalesByMonth = new Map();
    for (const order of orders) {
      const monthKey = `${order.createdAt.getUTCFullYear()}-${order.createdAt.getUTCMonth() + 1}`;
      const monthSales = categorySalesByMonth.get(monthKey) || new Map();
      for (const item of order.items) {
        const category = item.category || productCategoryMap.get(item.product?.toString()) || "Uncategorised";
        const amount = item.price * item.quantity;
        monthSales.set(category, (monthSales.get(category) || 0) + amount);
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
      }
      categorySalesByMonth.set(monthKey, monthSales);
    }

    const topCategories = [...categoryTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
    const monthlyCategorySales = months.map(({ key, label }) => {
      const monthSales = categorySalesByMonth.get(key) || new Map();
      const categories = Object.fromEntries(topCategories.map((name) => [name, monthSales.get(name) || 0]));
      const otherSales = [...monthSales.entries()]
        .filter(([name]) => !topCategories.includes(name))
        .reduce((total, [, amount]) => total + amount, 0);
      if (otherSales > 0) categories.Other = otherSales;
      return { label, categories };
    });

    const productSales = [...salesByProduct.values()].sort((a, b) => b.quantity - a.quantity);
    const segmentCounts = { "No orders": Math.max(0, totalUsers - allCustomerOrders.length), New: 0, Loyal: 0, VIP: 0, "At risk": 0, Lost: 0 };
    for (const customer of allCustomerOrders) {
      segmentCounts[getCustomerSegment(customer, now)] += 1;
    }

    const spendingCustomers = allCustomerOrders
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 40)
      .map((customer, index) => ({
        frequency: customer.orders,
        spend: customer.spend,
        lifetimeValue: customer.spend,
        segment: getCustomerSegment(customer, now),
        label: `Customer ${index + 1}`,
      }));

    const funnelVisitors = new Map();
    for (const event of analyticsEvents) {
      if (!funnelVisitors.has(event.visitorId)) funnelVisitors.set(event.visitorId, []);
      funnelVisitors.get(event.visitorId).push({ type: event.type, createdAt: event.createdAt });
    }
    for (const order of orders) {
      if (!order.analyticsVisitorId) continue;
      if (!funnelVisitors.has(order.analyticsVisitorId)) funnelVisitors.set(order.analyticsVisitorId, []);
      funnelVisitors.get(order.analyticsVisitorId).push({ type: "purchase", createdAt: order.createdAt });
    }

    const funnelCounts = Array(FUNNEL_STAGES.length).fill(0);
    for (const events of funnelVisitors.values()) {
      events.sort((a, b) => a.createdAt - b.createdAt);
      let stageIndex = 0;
      for (const event of events) {
        if (event.type === FUNNEL_STAGES[stageIndex]?.type) {
          funnelCounts[stageIndex] += 1;
          stageIndex += 1;
          if (stageIndex === FUNNEL_STAGES.length) break;
        }
      }
    }

    const funnel = FUNNEL_STAGES.map((stage, index) => ({
      name: stage.name,
      visitors: funnelCounts[index],
      conversionRate: index === 0 || funnelCounts[index - 1] === 0
        ? (index === 0 && funnelCounts[index] > 0 ? 100 : 0)
        : Math.round((funnelCounts[index] / funnelCounts[index - 1]) * 100),
    }));

    const productBubbles = productSales.slice(0, 20).map((product) => ({
      ...product,
      price: product.quantity ? product.revenue / product.quantity : 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          products: totalProducts,
          users: totalUsers,
          revenue: orderTotals?.revenue || 0,
          orders: orderTotals?.orders || 0,
        },
        userGrowth: monthLabels,
        categoryDistribution: categoryData,
        availabilityBreakdown: availabilityMap,
        topProducts: productSales.slice(0, 10),
        monthlyRevenue: [...monthlyRevenue.values()],
        customerSegments: Object.entries(segmentCounts).map(([name, customers]) => ({ name, customers })),
        spendingCustomers,
        purchaseHeatmap: weekdayHours,
        funnel,
        monthlyCategorySales,
        productBubbles,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const trackAnalyticsEvent = async (req, res) => {
  try {
    const { visitorId, type, productId } = req.body || {};
    const validTypes = ["visit", "product_view", "add_to_cart", "checkout_started"];

    const requiresProduct = type === "product_view" || type === "add_to_cart";
    if (
      typeof visitorId !== "string" ||
      !/^[\w-]{16,64}$/.test(visitorId) ||
      !validTypes.includes(type) ||
      (requiresProduct && (typeof productId !== "string" || productId.length === 0)) ||
      (productId !== undefined && (typeof productId !== "string" || productId.length > 64))
    ) {
      return res.status(400).json({ success: false, message: "Invalid analytics event" });
    }

    await AnalyticsEvent.create({ visitorId, type, productId });
    return res.status(202).json({ success: true });
  } catch (error) {
    console.error("Analytics event tracking failed:", error);
    return res.status(500).json({ success: false, message: "Failed to record analytics event" });
  }
};

export { getAnalytics, trackAnalyticsEvent };
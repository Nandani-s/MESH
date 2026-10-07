import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Category } from "../models/category.js";

const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    // Last 6 months for the user growth chart
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalProducts,
      totalUsers,
      userGrowth,
      productsByCategory,
      productsByAvailability,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),

      // Monthly user registrations for the last 6 months
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
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
    ]);

    // Build a full 6-month array so months with 0 registrations still appear
    const monthLabels = [];
    const growthMap = {};
    userGrowth.forEach((g) => {
      const key = `${g._id.year}-${g._id.month}`;
      growthMap[key] = g.count;
    });

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthLabels.push({ label, count: growthMap[key] || 0 });
    }

    // Add percentage to category distribution
    const totalForCategories = productsByCategory.reduce((s, c) => s + c.count, 0);
    const categoryData = productsByCategory.map((c) => ({
      name: c._id || 'Uncategorised',
      count: c.count,
      percentage: totalForCategories > 0 ? Math.round((c.count / totalForCategories) * 100) : 0,
    }));

    // Availability breakdown with friendly labels
    const availabilityMap = { InStock: 0, OutOfStock: 0, PreOrder: 0 };
    productsByAvailability.forEach((a) => {
      if (a._id in availabilityMap) availabilityMap[a._id] = a.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totals: { products: totalProducts, users: totalUsers },
        userGrowth: monthLabels,
        categoryDistribution: categoryData,
        availabilityBreakdown: availabilityMap,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getAnalytics };
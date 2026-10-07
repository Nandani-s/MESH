import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Category } from "../models/category.js";
import { Wishlist } from "../models/wishlist.js";

const getDashboardStats = async (req, res) => {
  try {
    // Run all counts in parallel for performance
    const [
      totalProducts,
      totalUsers,
      totalCategories,
      wishlistAgg,
      lowStockProducts,
      topWishlisted,
      recentUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),

      // Total items saved across all wishlists
      Wishlist.aggregate([
        { $project: { count: { $size: "$items" } } },
        { $group: { _id: null, total: { $sum: "$count" } } },
      ]),

      // Products with stock below 10 (low stock alert)
      Product.find({ stock: { $lt: 10 } })
        .select("name stock image availability")
        .sort({ stock: 1 })
        .limit(5),

      // Top 5 most wishlisted products
      Wishlist.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            product: { _id: 1, name: 1, image: 1, price: 1, stock: 1 },
            count: 1,
          },
        },
      ]),

      // 5 most recently registered users
      User.find()
        .select("name email createdAt role")
        .sort({ createdAt: -1 })
        .limit(5),

      // Users who joined this calendar month
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          products: totalProducts,
          users: totalUsers,
          categories: totalCategories,
          wishlistItems: wishlistAgg[0]?.total || 0,
          newUsersThisMonth,
        },
        lowStockProducts,
        topWishlisted,
        recentUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getDashboardStats };
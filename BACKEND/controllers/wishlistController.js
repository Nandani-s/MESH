import { Wishlist } from "../models/wishlist.js";

// GET /api/wishlist — returns the current user's wishlist with product details
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate("items.product");

    if (!wishlist) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Filter out any items whose product was deleted from the catalogue
    const validItems = wishlist.items.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      data: validItems,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/wishlist/:productId — add a product (idempotent: no error if already there)
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: [{ product: productId }],
      });
    } else {
      const alreadyAdded = wishlist.items.some(
        (item) => item.product.toString() === productId
      );

      if (!alreadyAdded) {
        wishlist.items.push({ product: productId });
        await wishlist.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/wishlist/:productId — remove a single product
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/wishlist — clear all items
const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/wishlist/check/:productId — check if a product is in the wishlist
// Used by product cards to know whether to show a filled or empty heart
const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    const isInWishlist = wishlist
      ? wishlist.items.some((item) => item.product.toString() === productId)
      : false;

    return res.status(200).json({ success: true, isInWishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/wishlist/analytics — admin only: top wishlisted products + summary stats
const getWishlistAnalytics = async (req, res) => {
  try {
    const topProducts = await Wishlist.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
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
          product: { _id: 1, name: 1, image: 1, price: 1, category: 1 },
          count: 1,
        },
      },
    ]);

    const totalWishlists = await Wishlist.countDocuments();
    const totalItems = await Wishlist.aggregate([
      { $project: { count: { $size: "$items" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        topProducts,
        totalWishlists,
        totalItems: totalItems[0]?.total || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, checkWishlist, getWishlistAnalytics };


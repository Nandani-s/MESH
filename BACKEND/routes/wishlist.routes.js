import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
  getWishlistAnalytics,
} from "../controllers/wishlistController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const wishlistRoute = Router();

// Admin analytics
wishlistRoute.get("/analytics", verifyUser, requireAdmin, getWishlistAnalytics);

// All wishlist routes require authentication — wishlist is personal to each user
wishlistRoute.get("/", verifyUser, getWishlist);
wishlistRoute.get("/check/:productId", verifyUser, checkWishlist);
wishlistRoute.post("/:productId", verifyUser, addToWishlist);
wishlistRoute.delete("/clear", verifyUser, clearWishlist);
wishlistRoute.delete("/:productId", verifyUser, removeFromWishlist);

export default wishlistRoute;
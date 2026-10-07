import express from "express";
import verifyUser from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// All cart routes require login
router.use(verifyUser);

router.get("/", getCart);
router.post("/:productId", addToCart);
router.put("/:productId", updateQuantity);
router.delete("/clear", clearCart);          // MUST be before /:productId
router.delete("/:productId", removeFromCart);

export default router;
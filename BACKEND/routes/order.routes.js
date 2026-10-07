import express from "express";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// ─── Customer routes (login required) ───
router.post("/", verifyUser, createOrder);
router.get("/my", verifyUser, getMyOrders);

// ─── Admin routes (login + admin role) ───
router.get("/", verifyUser, requireAdmin, getAllOrders);
router.get("/:id", verifyUser, requireAdmin, getOrderById);
router.put("/:id/status", verifyUser, requireAdmin, updateOrderStatus);

export default router;
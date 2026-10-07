import { Router } from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const categoryRoute = Router();

// Public — the shop/frontend needs to list categories to filter products.
categoryRoute.get("/", getAllCategories);

// Admin only — creating, editing, and deleting categories.
categoryRoute.post("/", verifyUser, requireAdmin, createCategory);
categoryRoute.put("/:id", verifyUser, requireAdmin, updateCategory);
categoryRoute.delete("/:id", verifyUser, requireAdmin, deleteCategory);

export default categoryRoute;
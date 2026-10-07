import express from "express";

import {upload } from "../middleware/multer.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

// Browsing products is public — no auth required.
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Creating, editing, and deleting products is admin-only.
router.post(
  "/create",
  verifyUser,
  requireAdmin,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  verifyUser,
  requireAdmin,
  upload.single("image"),
  updateProduct
);

router.delete("/:id", verifyUser, requireAdmin, deleteProduct);

export default router;
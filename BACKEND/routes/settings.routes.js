import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const settingsRoute = Router();

// Public read — frontend may need store name, currency, shipping thresholds
settingsRoute.get("/", getSettings);

// Admin only write
settingsRoute.put("/", verifyUser, requireAdmin, updateSettings);

export default settingsRoute;
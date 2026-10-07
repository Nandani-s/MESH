import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const dashboardRoute = Router();

dashboardRoute.get("/", verifyUser, requireAdmin, getDashboardStats);

export default dashboardRoute;
import { Router } from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const analyticsRoute = Router();

analyticsRoute.get("/", verifyUser, requireAdmin, getAnalytics);

export default analyticsRoute;
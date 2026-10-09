import { Router } from "express";
import { getAnalytics, trackAnalyticsEvent } from "../controllers/analyticsController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const analyticsRoute = Router();

analyticsRoute.get("/", verifyUser, requireAdmin, getAnalytics);
analyticsRoute.post("/event", trackAnalyticsEvent);

export default analyticsRoute;
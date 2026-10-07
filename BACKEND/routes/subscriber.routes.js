import { Router } from "express";
import { subscribe, getAllSubscribers } from "../controllers/subscriberController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const subscriberRoute = Router();

subscriberRoute.post("/", subscribe);
subscriberRoute.get("/", verifyUser, requireAdmin, getAllSubscribers);

export default subscriberRoute;

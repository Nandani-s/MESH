import { Router } from "express";
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  updateSubscriber,
  deleteSubscriber,
} from "../controllers/subscriberController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const newsletterRoute = Router();

newsletterRoute.post("/subscribe", subscribe);
newsletterRoute.post("/unsubscribe", unsubscribe);
newsletterRoute.get("/", verifyUser, requireAdmin, getAllSubscribers);
newsletterRoute.put("/:id", verifyUser, requireAdmin, updateSubscriber);
newsletterRoute.delete("/:id", verifyUser, requireAdmin, deleteSubscriber);

export default newsletterRoute;

import { Router } from "express";
import {
  submitContact,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/contactController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const contactRoute = Router();

// Public — anyone can send a message
contactRoute.post("/", submitContact);

// Admin only — read and manage messages
contactRoute.get("/", verifyUser, requireAdmin, getAllMessages);
contactRoute.put("/:id", verifyUser, requireAdmin, updateMessageStatus);
contactRoute.delete("/:id", verifyUser, requireAdmin, deleteMessage);

export default contactRoute;
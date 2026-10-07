import express from "express";
import verifyUser from "../middleware/authMiddleware.js";
import {
  initiateKhalti,
  khaltiCallback,
  initiateEsewa,
  esewaCallback,
} from "../controllers/paymentController.js";

const router = express.Router();

// Initiate (require login)
router.post("/khalti/initiate", verifyUser, initiateKhalti);
router.post("/esewa/initiate", verifyUser, initiateEsewa);

// Callbacks (NO auth — gateway redirects here)
router.get("/khalti/callback", khaltiCallback);
router.get("/esewa/callback", esewaCallback);

export default router;
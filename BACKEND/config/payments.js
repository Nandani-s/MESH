import dotenv from "dotenv";
import { NepPayments } from "neppayments";

// Load .env BEFORE creating the payment instance
dotenv.config({ path: "./.env" });

const khaltiKey = process.env.KHALTI_SECRET_KEY;
const esewaKey = process.env.ESEWA_SECRET_KEY;

if (!khaltiKey) {
  console.warn("⚠️  KHALTI_SECRET_KEY missing from .env — Khalti payments disabled");
}
if (!esewaKey) {
  console.warn("⚠️  ESEWA_SECRET_KEY missing from .env — eSewa payments disabled");
}

const unavailableGateway = {
  createPayment() {
    throw new Error("Payment gateway is not configured");
  },
  verifyPayment() {
    throw new Error("Payment gateway is not configured");
  },
};

// Only create the instance if at least one gateway has credentials.
const payments =
  khaltiKey || esewaKey
    ? new NepPayments({
        khalti: khaltiKey
          ? {
              secretKey: khaltiKey,
              environment: "sandbox", // change to "production" later
            }
          : undefined,
        esewa: esewaKey
          ? {
              productCode: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
              secretKey: esewaKey,
              environment: "sandbox",
              successUrl: `${process.env.BACKEND_URL}/api/payment/esewa/callback`,
              failureUrl: `${process.env.FRONTEND_URL}/payment/failure`,
            }
          : undefined,
      })
    : {
        khalti: unavailableGateway,
        esewa: unavailableGateway,
      };

export default payments;
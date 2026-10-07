import payments from "../config/payments.js";
import { Order } from "../models/order.js";
import sendEmail from "../utils/sendEmail.js";

// Fallback URLs in case .env isn't loaded
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── KHALTI ───

// POST /api/payment/khalti/initiate
const initiateKhalti = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("🔍 Khalti initiate request:");
    console.log("  orderId:", orderId);
    console.log("  BACKEND_URL:", BACKEND_URL);
    console.log("  FRONTEND_URL:", FRONTEND_URL);
    console.log("  KHALTI_SECRET_KEY:", process.env.KHALTI_SECRET_KEY ? "✅ set" : "❌ missing");

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Khalti requires amount in PAISA (Rs. 1 = 100 paisa)
    const amountInPaisa = Math.round(order.totalAmount * 100);
    console.log("  amount (paisa):", amountInPaisa);

    const khaltiPayment = await payments.khalti.createPayment({
      amount: amountInPaisa,
      purchase_order_id: order._id.toString(),
      purchase_order_name: `MESH Order #${order._id.toString().slice(-8).toUpperCase()}`,
      return_url: `${BACKEND_URL}/api/payment/khalti/callback`,
      website_url: FRONTEND_URL,
      customer_info: {
        name: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        email: req.user?.email || "",
      },
    });

    console.log("  ✅ Khalti response:", khaltiPayment);

    // Store pidx for verification
    order.transactionId = khaltiPayment.pidx;
    await order.save();

    return res.status(200).json({
      success: true,
      payment_url: khaltiPayment.payment_url,
      pidx: khaltiPayment.pidx,
    });
  } catch (error) {
    console.error("❌ Khalti initiate error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// GET /api/payment/khalti/callback
const khaltiCallback = async (req, res) => {
  try {
    const { pidx, status, transaction_id } = req.query;

    console.log("🔍 Khalti callback:", { pidx, status, transaction_id });

    if (status !== "Completed") {
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    // Verify with Khalti
    const verification = await payments.khalti.verifyPayment({ pidx });
    console.log("  verification:", verification);

    if (verification.status !== "Completed") {
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    // Find order by pidx (stored in transactionId)
    const order = await Order.findOne({ transactionId: pidx });
    if (!order) {
      console.error("  ❌ Order not found for pidx:", pidx);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    // Mark as paid
    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.transactionId = transaction_id;
    await order.save();

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user?.email || order.shippingAddress.phone,
        subject: `Payment Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
        html: `<h2>Payment received!</h2><p>Your order is being processed.</p>`,
      });
    } catch (e) {
      console.error("Email failed:", e.message);
    }

    return res.redirect(`${FRONTEND_URL}/payment/success?order=${order._id}`);
  } catch (error) {
    console.error("❌ Khalti callback error:", error);
    return res.redirect(`${FRONTEND_URL}/payment/failure`);
  }
};

// ─── ESEWA ───

// POST /api/payment/esewa/initiate
const initiateEsewa = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("🔍 eSewa initiate request:");
    console.log("  orderId:", orderId);
    console.log("  ESEWA_SECRET_KEY:", process.env.ESEWA_SECRET_KEY ? "✅ set" : "❌ missing");
    console.log("  ESEWA_PRODUCT_CODE:", process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const esewaPayment = await payments.esewa.createPayment({
      amount: order.totalAmount, // eSewa uses RUPEES (not paisa)
      tax_amount: 0,
      total_amount: order.totalAmount,
      transaction_uuid: order._id.toString(),
      product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${BACKEND_URL}/api/payment/esewa/callback`,
      failure_url: `${FRONTEND_URL}/payment/failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    });

    console.log("  ✅ eSewa response ready");

    return res.status(200).json({
      success: true,
      form_html: esewaPayment.form_html,
    });
  } catch (error) {
    console.error("❌ eSewa initiate error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// GET /api/payment/esewa/callback
const esewaCallback = async (req, res) => {
  try {
    const { data } = req.query;
    console.log("🔍 eSewa callback received");

    const verification = await payments.esewa.verifyPayment({ data });
    console.log("  verification:", verification);

    if (!verification.success) {
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    // Decode to get transaction_uuid (= order id)
    const decoded = JSON.parse(Buffer.from(data, "base64").toString());
    const orderId = decoded.transaction_uuid;

    const order = await Order.findById(orderId);
    if (!order) {
      console.error("  ❌ Order not found:", orderId);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.transactionId = decoded.transaction_code || verification.transaction_code;
    await order.save();

    return res.redirect(`${FRONTEND_URL}/payment/success?order=${order._id}`);
  } catch (error) {
    console.error("❌ eSewa callback error:", error);
    return res.redirect(`${FRONTEND_URL}/payment/failure`);
  }
};

export { initiateKhalti, khaltiCallback, initiateEsewa, esewaCallback };
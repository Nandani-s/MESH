import payments from "../config/payments.js";
import { Order } from "../models/order.js";
import sendEmail from "../utils/sendEmail.js";
import { getPublicUrls } from "../config/publicUrls.js";

const { backendUrl: BACKEND_URL, frontendUrl: FRONTEND_URL } = getPublicUrls();
const isCompletedStatus = (status) =>
  typeof status === "string" && status.toUpperCase() === "COMPLETED";

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
    const { pidx } = req.query;

    console.log("🔍 Khalti callback:", { pidx });

    if (typeof pidx !== "string" || !pidx) {
      console.error("  ❌ Khalti callback is missing a valid pidx");
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const verification = await payments.khalti.verifyPayment({ pidx });
    console.log("  verification:", verification);

    if (!isCompletedStatus(verification.status)) {
      console.error("  ❌ Khalti payment is not completed:", verification.status);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const verifiedOrderId = verification.payment_details?.purchase_order_id;
    let order = typeof verifiedOrderId === "string" && /^[\da-f]{24}$/i.test(verifiedOrderId)
      ? await Order.findById(verifiedOrderId)
      : null;

    // Fall back to the pidx saved when checkout initiated the payment.
    if (!order) order = await Order.findOne({ transactionId: pidx });
    if (!order) {
      console.error("  ❌ No order matches the verified Khalti payment:", pidx);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }
    if (Number(verification.amount) !== Math.round(order.totalAmount * 100)) {
      console.error("  ❌ Khalti payment amount does not match order:", order._id);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const wasAlreadyPaid = order.paymentStatus === "paid";
    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    // Keep pidx so a repeated provider callback can find the same order.
    order.transactionId = pidx;
    await order.save();

    if (!wasAlreadyPaid) {
      try {
        await sendEmail({
          to: req.user?.email || order.shippingAddress.phone,
          subject: `Payment Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
          html: `<h2>Payment received!</h2><p>Your order is being processed.</p>`,
        });
      } catch (e) {
        console.error("Email failed:", e.message);
      }
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

    if (typeof data !== "string") {
      console.error("  ❌ eSewa callback is missing payment data");
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    } catch (error) {
      console.error("  ❌ Could not decode eSewa callback data:", error.message);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const orderId = decoded.transaction_uuid;
    const order = await Order.findById(orderId);
    if (!order) {
      console.error("  ❌ Order not found:", orderId);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const productCode =
      process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    if (
      decoded.product_code !== productCode ||
      Number(decoded.total_amount) !== Number(order.totalAmount)
    ) {
      console.error("  ❌ eSewa payment details do not match order:", order._id);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const verification = await payments.esewa.verifyPayment({
      product_code: productCode,
      transaction_uuid: orderId,
      total_amount: Number(order.totalAmount),
    });
    console.log("  verification:", verification);

    if (!isCompletedStatus(verification.status)) {
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }
    if (Number(verification.amount) !== Number(order.totalAmount)) {
      console.error("  ❌ eSewa verified amount does not match order:", order._id);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.transactionId =
      decoded.transaction_code || verification.transaction_id || orderId;
    await order.save();

    return res.redirect(`${FRONTEND_URL}/payment/success?order=${order._id}`);
  } catch (error) {
    console.error("❌ eSewa callback error:", error);
    return res.redirect(`${FRONTEND_URL}/payment/failure`);
  }
};

export { initiateKhalti, khaltiCallback, initiateEsewa, esewaCallback };
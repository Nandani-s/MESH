import { Order } from "../models/order.js";
import { Cart } from "../models/cart.js";
import sendEmail from "../utils/sendEmail.js";
// ─── ADMIN ───────────────────────────────────────────────

// GET /api/order — all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/order/:id — single order (admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/order/:id/status — update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("user", "name email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.status(200).json({ success: true, data: order, message: "Order updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CUSTOMER ────────────────────────────────────────────

// POST /api/order — create order from cart (customer)
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, analyticsVisitorId } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Shipping address and payment method are required" });
    }
    if (analyticsVisitorId !== undefined && (
      typeof analyticsVisitorId !== "string" ||
      !/^[\w-]{16,64}$/.test(analyticsVisitorId)
    )) {
      return res.status(400).json({ success: false, message: "Invalid analytics visitor ID" });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name image price availability category");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // Check all items are in stock
    const outOfStock = cart.items.filter(
      (item) => item.product?.availability === "OutOfStock"
    );
    if (outOfStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items are out of stock: ${outOfStock.map(i => i.product.name).join(", ")}`,
      });
    }

    // Build order items snapshot
    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      category: item.product.category || "Uncategorised",
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      analyticsVisitorId,
    });

    // Clear the cart after placing order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // ─── Send confirmation email to customer ───
    try {
      const itemsHtml = order.items
        .map(
          (item) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.price}</td>
            </tr>`
        )
        .join("");

      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
            <h1 style="color:#111;">MESH</h1>
            <h2>Thank you for your order, ${req.user.name}!</h2>
            <p>Your order has been placed successfully.</p>
            <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px;text-align:left;">Item</th>
                  <th style="padding:8px;text-align:center;">Qty</th>
                  <th style="padding:8px;text-align:right;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <p style="margin-top:16px;font-size:18px;"><strong>Total: Rs. ${order.totalAmount}</strong></p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Shipping To:</strong><br>
              ${order.shippingAddress.fullName}<br>
              ${order.shippingAddress.phone}<br>
              ${order.shippingAddress.address}, ${order.shippingAddress.city}
            </p>
            <p style="margin-top:24px;color:#666;">We'll notify you when your order ships.</p>
            <p style="color:#666;">— Team MESH</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Customer email failed:", emailErr.message);
    }

    // ─── Send notification email to admin ───
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `🔔 New Order — #${order._id.toString().slice(-8).toUpperCase()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
            <h2>New Order Received</h2>
            <p><strong>Order:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Customer:</strong> ${req.user.name} (${req.user.email})</p>
            <p><strong>Total:</strong> Rs. ${order.totalAmount}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod}</p>
            <p><strong>Items:</strong> ${order.items.length}</p>
            <p style="margin-top:16px;">
              <a href="http://localhost:5173/admin/orders"
                 style="background:#111;color:#fff;padding:10px 16px;text-decoration:none;border-radius:4px;">
                 View in Admin Panel
              </a>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Admin notification failed:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/order/my — customer's own orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getAllOrders, getOrderById, updateOrderStatus, createOrder, getMyOrders };
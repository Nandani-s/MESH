import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";

// GET /api/cart — get current user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name image price availability"
    );
    if (!cart) return res.status(200).json({ success: true, data: [] });
    return res.status(200).json({ success: true, data: cart.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/cart/:productId — add product (or increase qty)
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity) || 1;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.availability === "OutOfStock") {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existing = cart.items.find((i) => i.product.toString() === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }

    await cart.populate("items.product", "name image price availability");
    return res.status(200).json({ success: true, data: cart.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/cart/:productId — set exact quantity
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name image price availability");

    return res.status(200).json({ success: true, data: cart.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/cart/:productId — remove single item
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    await cart.populate("items.product", "name image price availability");

    return res.status(200).json({ success: true, data: cart.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/cart/clear — remove all items
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(200).json({ success: true, data: [] });

    cart.items = [];
    await cart.save();
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
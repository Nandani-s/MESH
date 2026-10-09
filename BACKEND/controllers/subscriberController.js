import { Subscriber } from "../models/subscriber.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/newsletter/subscribe — public
const subscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        existing.subscribedAt = new Date();
        await existing.save();
        return res.status(200).json({ success: true, message: "Welcome back! You're subscribed again." });
      }
      return res.status(200).json({ success: true, message: "You're already subscribed!" });
    }

    try {
      await Subscriber.create({ email });
      return res.status(201).json({ success: true, message: "Subscribed successfully!" });
    } catch (error) {
      if (error.code !== 11000) throw error;
      return res.status(200).json({ success: true, message: "You're already subscribed!" });
    }
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return res.status(500).json({ success: false, message: "Failed to subscribe. Please try again." });
  }
};

// POST /api/newsletter/unsubscribe — public
const unsubscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const subscriber = await Subscriber.findOneAndUpdate(
      { email },
      { $set: { status: "unsubscribed" } },
      { new: true }
    );
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "No subscription was found for that email." });
    }

    return res.status(200).json({ success: true, message: "You have been unsubscribed." });
  } catch (error) {
    console.error("Newsletter unsubscribe failed:", error);
    return res.status(500).json({ success: false, message: "Failed to unsubscribe. Please try again." });
  }
};

// GET /api/newsletter — admin only
const getAllSubscribers = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;
    const filter = {};
    if (search) filter.email = { $regex: escapeRegex(String(search).trim()), $options: "i" };
    if (status === "active") {
      filter.$or = [{ status: "active" }, { status: { $exists: false } }];
    } else if (status === "unsubscribed") {
      filter.status = "unsubscribed";
    } else if (status !== "all") {
      return res.status(400).json({ success: false, message: "Invalid subscriber status filter" });
    }

    const records = await Subscriber.find(filter).sort({ subscribedAt: -1, createdAt: -1 }).lean();
    const subscribers = records.map((subscriber) => ({
      ...subscriber,
      status: subscriber.status || "active",
      subscribedAt: subscriber.subscribedAt || subscriber.createdAt,
    }));
    return res.status(200).json({ success: true, data: subscribers, count: subscribers.length });
  } catch (error) {
    console.error("Newsletter subscriber list failed:", error);
    return res.status(500).json({ success: false, message: "Failed to load subscribers." });
  }
};

// PUT /api/newsletter/:id — admin only
const updateSubscriber = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["active", "unsubscribed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be active or unsubscribed" });
    }

    const update = { status };
    if (status === "active") update.subscribedAt = new Date();
    const subscriber = await Subscriber.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    return res.status(200).json({ success: true, data: subscriber });
  } catch (error) {
    console.error("Newsletter subscriber update failed:", error);
    return res.status(500).json({ success: false, message: "Failed to update subscriber." });
  }
};

// DELETE /api/newsletter/:id — admin only
const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    return res.status(200).json({ success: true, message: "Subscriber removed." });
  } catch (error) {
    console.error("Newsletter subscriber removal failed:", error);
    return res.status(500).json({ success: false, message: "Failed to remove subscriber." });
  }
};

export { subscribe, unsubscribe, getAllSubscribers, updateSubscriber, deleteSubscriber };

import { Subscriber } from "../models/subscriber.js";

// POST /api/subscribe — public
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: "You're already subscribed!" });
    }

    await Subscriber.create({ email });
    return res.status(201).json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subscribe — admin only
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: subscribers, count: subscribers.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { subscribe, getAllSubscribers };

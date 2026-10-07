import { Settings } from "../models/settings.js";

// GET /api/settings — public read so the frontend can use store name, currency, etc.
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findById("store_settings");

    // Auto-create with defaults on first request
    if (!settings) {
      settings = await Settings.create({ _id: "store_settings" });
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings — admin only
const updateSettings = async (req, res) => {
  try {
    // Never allow _id or __v to be overwritten
    const { _id, __v, ...updates } = req.body;

    const settings = await Settings.findByIdAndUpdate(
      "store_settings",
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getSettings, updateSettings };
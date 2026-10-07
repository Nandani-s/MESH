import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // Singleton key — ensures only one settings document ever exists
    _id: { type: String, default: "store_settings" },

    // General
    storeName: { type: String, default: "My Store" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    currency: { type: String, default: "NPR" },
    timezone: { type: String, default: "UTC" },

    // Payment — toggles only; actual API keys stay in .env
    codEnabled: { type: Boolean, default: true },
    khaltiEnabled: { type: Boolean, default: false },
    esewaEnabled: { type: Boolean, default: false },

    // Shipping
    freeShippingThreshold: { type: Number, default: 0 },
    standardShippingRate: { type: Number, default: 0 },
    expressShippingRate: { type: Number, default: 0 },

    // Notifications — saved but only active once an email service is wired up
    orderEmailNotifications: { type: Boolean, default: true },
    lowStockAlert: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
    newCustomerAlert: { type: Boolean, default: false },

    // Security — saved as preferences; full implementation (2FA, auto-logout)
    // requires additional infrastructure beyond what's currently in the project
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    passwordExpiry: { type: Number, default: 90 },
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      maxlength: 64,
    },
    type: {
      type: String,
      enum: ["visit", "product_view", "add_to_cart", "checkout_started"],
      required: true,
    },
    productId: {
      type: String,
      maxlength: 64,
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ visitorId: 1, createdAt: 1 });
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

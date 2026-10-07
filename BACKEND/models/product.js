import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    // Cloudinary's public_id for the uploaded image, needed to delete the
    // asset from Cloudinary when the product is deleted or its image is replaced.
    imagePublicId: {
      type: String,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceCurrency: {
      type: String,
      default: "RS",
    },

    availability: {
      type: String,
      enum: ["InStock", "OutOfStock", "PreOrder"],
      default: "InStock",
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
	originalPrice: {
  type: Number,
  default: null,
},

    aggregateRating: {

      ratingValue: {
        type: Number,
        default: 0,
      },

      reviewCount: {
        type: Number,
        default: 0,
      },

    },

    reviews: [reviewSchema],

  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
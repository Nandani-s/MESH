import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.mongodb;

  if (!mongoUri) {
    throw new Error("MongoDB connection string is missing. Set MONGO_URI in .env.");
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
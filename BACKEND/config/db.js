import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongodb);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
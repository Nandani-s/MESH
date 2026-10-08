import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODBURI;

  if (!mongoUri) {
    throw new Error("MongoDB connection string is missing. Set MONGO_URI in .env (see .env.example).");
  }

  try {
    await mongoose.connect(mongoUri);

    console.log(
      `✅ MongoDB Connected (db: ${mongoose.connection.db.databaseName})`
    );
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
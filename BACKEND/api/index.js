import { app } from "../app.js";
import connectDB from "../config/db.js";

let databaseConnection;

const getDatabaseConnection = () => {
  if (!databaseConnection) {
    databaseConnection = connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  return databaseConnection;
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return app(req, res);
  }

  try {
    await getDatabaseConnection();
  } catch (error) {
    console.error("MongoDB connection failed while handling a request:", error);
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable",
    });
  }

  return app(req, res);
}

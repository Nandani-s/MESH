import { app } from "./app.js";
import connectDB from "./config/db.js";

connectDB()
  .then(() => {
    const port = process.env.PORT || 5001;
    const server = app.listen(port);
    server.once("listening", () => {
      console.log(`⚙️ Server running on port ${port}`);
    });
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${port} is already in use by another program. ` +
            `Free it or set a different PORT in BACKEND/.env`
        );
      } else {
        console.error("❌ Server failed to start:", err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
    process.exit(1);
  });

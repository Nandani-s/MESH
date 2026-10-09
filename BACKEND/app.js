import express from "express";
import dotenv from "dotenv";
dotenv.config({path : "./.env"});
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/auth.routes.js";
import productRoute from "./routes/product.routes.js";
import categoryRoute from "./routes/category.routes.js";
import wishlistRoute from "./routes/wishlist.routes.js";
import settingsRoute from "./routes/settings.routes.js";
import dashboardRoute from "./routes/dashboard.routes.js";
import analyticsRoute from "./routes/analytics.routes.js";
import contactRoute from "./routes/contact.routes.js";
import subscriberRoute from "./routes/subscriber.routes.js";
import newsletterRoute from "./routes/newsletter.routes.js";
import paymentRoute from "./routes/payment.routes.js";
import cartRoute from "./routes/cart.routes.js";
import orderRoute from "./routes/order.routes.js";
// import blogRoute from "./routes/blog.routes.js";


const app = express();
//dotenv.config({path : "./.env"});

console.log("CORS_ORIGIN:",process.env.CORS_ORIGIN); // Debugging line to check CORS_ORIGIN value
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true

}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));// ye line public folder ko static bana deti hai, jisme hum apne images ko store karenge, taki hum unhe access kar sake thru URL.

// Prevent API response caching (fixes 304 errors)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/category', categoryRoute);
app.use('/api/wishlist', wishlistRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/contact', contactRoute);
app.use('/api/subscribe', subscriberRoute);
app.use('/api/newsletter', newsletterRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/cart', cartRoute);
app.use('/api/order', orderRoute);
// app.use('/api/blog', blogRoute);

// Catches anything not handled inside a route's own try/catch — e.g. multer
// errors (bad file type, file too large, disk write failure). Without this,
// Express's default handler returns an HTML error page, which the frontend
// can't parse as JSON, and the real error never gets logged anywhere visible.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export { app };
export default app;

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";
// import blogRoute from "./routes/blog.routes.js";


const app = express();
dotenv.config({path : "./.env"});

console.log("CORS_ORIGIN:",process.env.CORS_ORIGIN); // Debugging line to check CORS_ORIGIN value
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true

}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));// ye line public folder ko static bana deti hai, jisme hum apne images ko store karenge, taki hum unhe access kar sake thru URL.



app.use('/api/user', userRoute);
// app.use('/api/blog', blogRoute);

export { app}
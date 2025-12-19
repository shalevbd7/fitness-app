import express from "express";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import diaryRoutes from "./routes/diary.route.js";
import profileRouter from "./routes/user.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import workoutRouter from "./routes/workout.route.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();

// Middleware configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/workouts", workoutRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});

import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using the URI provided in environment variables.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:" + error);
  }
};

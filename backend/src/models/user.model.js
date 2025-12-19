import mongoose from "mongoose";

/**
 * Schema representing the user's personal profile and targets.
 */
const profileSchema = new mongoose.Schema({
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  dailyCalorieTarget: { type: Number, default: 2000 },
  dailyProteinTarget: { type: Number, default: 150 },
  dailyCarbTarget: { type: Number, default: 300 },
  dailyFatTarget: { type: Number, default: 70 },
  // UI theme preference for the user
  theme: { type: String, default: "business" },
});

/**
 * Main User schema including authentication data and history.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    weightHistory: [
      {
        weight: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

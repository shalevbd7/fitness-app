import mongoose from "mongoose";

/**
 * Schema representing an individual food item within a meal.
 */
const foodItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  amountConsumed: {
    type: Number,
    required: true,
    min: 0.1,
  },
  unit: {
    type: String,
    default: "gram",
  },
  // List of components for complex dishes or meals
  ingredients: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      amount: Number,
      unit: String,
    },
  ],
  calculatedValues: {
    type: new mongoose.Schema(
      {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
      },
      { _id: false }
    ),
    required: true,
  },
});

/**
 * Schema representing a meal containing multiple food items.
 */
const mealSchema = new mongoose.Schema(
  {
    items: [foodItemSchema],
  },
  { _id: false }
);

/**
 * Schema for the user's daily log, tracking meals, nutrients, and workouts.
 */
const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    meals: {
      breakfast: { type: mealSchema, default: () => ({ items: [] }) },
      snack: { type: mealSchema, default: () => ({ items: [] }) },
      lunch: { type: mealSchema, default: () => ({ items: [] }) },
      dinner: { type: mealSchema, default: () => ({ items: [] }) },
    },
    totals: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    workouts: [],
  },
  { timestamps: true }
);

// Ensure a unique log per user for each specific date
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model("DailyLog", dailyLogSchema);

export default DailyLog;

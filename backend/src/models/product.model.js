import mongoose from "mongoose";

/**
 * Sub-schema for standardized nutritional values.
 */
const nutritionalValuesSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number,
      required: true,
      default: 0,
    },
    carbs: {
      type: Number,
      required: true,
      default: 0,
    },
    fat: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

/**
 * Schema for food products available in the system.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    valuesPer100g: {
      type: nutritionalValuesSchema,
      required: true,
    },
    unit: {
      type: String,
      enum: ["gram", "ml", "unit"],
      default: "gram",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

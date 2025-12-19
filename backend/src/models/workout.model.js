import mongoose from "mongoose";

/**
 * Schema for a single set within an exercise.
 * Tracks specific performance metrics for that instance.
 */
const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    required: true,
    default: 0, // 0 can imply bodyweight
    min: 0,
  },
});

/**
 * Schema for an exercise performed during a workout.
 * Contains the name and an array of performed sets.
 */
const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Bench Press", "Squat"
  },
  // Array of sets allows different weights/reps per set
  sets: [setSchema],
});

/**
 * Main Workout Schema.
 * Represents a full training session linked to a user and a specific date.
 */
const workoutSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true, // e.g., "Leg Day", "Push Workout"
    },
    duration: {
      type: Number,
      default: 0, // Duration in minutes
      min: 0,
    },
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

// Index to quickly fetch workouts for a user on a specific date
workoutSchema.index({ userId: 1, date: 1 });

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;

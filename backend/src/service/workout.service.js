import Workout from "../models/workout.model.js";

/**
 * Fetches workouts performed on a specific date (00:00 to 23:59).
 */
export const getWorkoutsByDate = async (userId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const workouts = await Workout.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ createdAt: 1 }); // Sort by creation time

  return workouts;
};

/**
 * Creates a new workout document.
 */
export const createWorkout = async (userId, workoutData) => {
  const { date, name, duration, exercises } = workoutData;

  const newWorkout = new Workout({
    userId,
    date: new Date(date),
    name,
    duration: duration || 0,
    exercises: exercises || [],
  });

  await newWorkout.save();
  return newWorkout;
};

/**
 * Updates a workout. Validates ownership before updating.
 */
export const updateWorkout = async (userId, workoutId, updates) => {
  const workout = await Workout.findOne({ _id: workoutId, userId });

  if (!workout) {
    throw new Error("Workout not found or unauthorized");
  }

  // Update fields if provided
  if (updates.name) workout.name = updates.name;
  if (updates.duration !== undefined) workout.duration = updates.duration;
  if (updates.exercises) workout.exercises = updates.exercises;
  if (updates.date) workout.date = new Date(updates.date);

  await workout.save();
  return workout;
};

/**
 * Deletes a workout.
 */
export const deleteWorkout = async (userId, workoutId) => {
  const result = await Workout.deleteOne({ _id: workoutId, userId });

  if (result.deletedCount === 0) {
    throw new Error("Workout not found or unauthorized");
  }

  return true;
};

import {
  getWorkoutsByDate,
  createWorkout,
  deleteWorkout,
  updateWorkout,
} from "../service/workout.service.js";

/**
 * Retrieves all workouts for a specific user and date.
 */
export const getWorkoutsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = req.query.date || new Date();

    const workouts = await getWorkoutsByDate(userId, date);
    res.status(200).json({ success: true, workouts });
  } catch (error) {
    console.error("Error in getWorkoutsController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creates a new workout entry.
 */
export const addWorkoutController = async (req, res) => {
  try {
    const userId = req.user._id;
    // Expected body: { date, name, duration, exercises: [...] }
    const workoutData = req.body;

    if (!workoutData.date || !workoutData.name) {
      return res
        .status(400)
        .json({ success: false, message: "Date and Name are required" });
    }

    const newWorkout = await createWorkout(userId, workoutData);
    res.status(201).json({ success: true, workout: newWorkout });
  } catch (error) {
    console.error("Error in addWorkoutController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Updates an existing workout (e.g., adding sets, changing duration).
 */
export const updateWorkoutController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    const updatedWorkout = await updateWorkout(userId, id, updates);
    res.status(200).json({ success: true, workout: updatedWorkout });
  } catch (error) {
    console.error("Error in updateWorkoutController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Deletes a workout entry.
 */
export const deleteWorkoutController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await deleteWorkout(userId, id);
    res.status(200).json({ success: true, message: "Workout deleted" });
  } catch (error) {
    console.error("Error in deleteWorkoutController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

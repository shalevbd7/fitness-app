import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const WORKOUT_API = "/workouts";

/**
 * Fetches workouts for a specific date.
 */
export const getWorkouts = async (date) => {
  try {
    const response = await axiosInstance.get(WORKOUT_API, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching workouts:", error);
    throw error;
  }
};

/**
 * Adds a new workout session.
 */
export const addWorkout = async (workoutData) => {
  try {
    const response = await axiosInstance.post(
      `${WORKOUT_API}/add`,
      workoutData
    );
    toast.success("Workout saved successfully!");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error saving workout.");
    throw error;
  }
};

/**
 * Updates an existing workout.
 */
export const updateWorkout = async (id, updates) => {
  try {
    const response = await axiosInstance.patch(`${WORKOUT_API}/${id}`, updates);
    toast.success("Workout updated!");
    return response.data;
  } catch (error) {
    toast.error("Error updating workout.");
    throw error;
  }
};

/**
 * Deletes a workout session.
 */
export const deleteWorkout = async (id) => {
  try {
    const response = await axiosInstance.delete(`${WORKOUT_API}/${id}`);
    toast.success("Workout deleted.");
    return response.data;
  } catch (error) {
    toast.error("Error deleting workout.");
    throw error;
  }
};

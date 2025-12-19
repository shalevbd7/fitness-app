import { create } from "zustand";
import * as workoutService from "../services/workoutService";

/**
 * Zustand Store for managing global workout state.
 * Handles data fetching, CRUD operations, and date selection state.
 */
export const useWorkoutStore = create((set, get) => ({
  workouts: [],
  isLoading: false,
  currentDate: new Date().toISOString().split("T")[0],

  /**
   * Sets the currently selected date and automatically triggers a data fetch.
   * @param {string} date - ISO date string (YYYY-MM-DD).
   */
  setCurrentDate: (date) => {
    set({ currentDate: date });
    get().fetchWorkouts(date);
  },

  /**
   * Fetches the list of workouts for a specific date from the API.
   */
  fetchWorkouts: async (date) => {
    const dateToFetch = date || get().currentDate;
    set({ isLoading: true });
    try {
      const res = await workoutService.getWorkouts(dateToFetch);
      set({ workouts: res.workouts || [] });
    } catch (error) {
      set({ workouts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Creates a new workout session and updates the local state.
   */
  addWorkout: async (workoutData) => {
    set({ isLoading: true });
    try {
      const res = await workoutService.addWorkout(workoutData);
      if (res.workout) {
        set((state) => ({ workouts: [...state.workouts, res.workout] }));
      }
      return true;
    } catch (error) {
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Updates an existing workout (e.g., editing exercises, changing duration).
   * Updates the local state optimistically to reflect changes immediately.
   */
  updateWorkout: async (workoutId, updates) => {
    try {
      const res = await workoutService.updateWorkout(workoutId, updates);

      if (res.workout) {
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w._id === workoutId ? res.workout : w
          ),
        }));
      }
      return true;
    } catch (error) {
      console.error("Update workout error:", error);
      return false;
    }
  },

  /**
   * Deletes a workout session by ID and removes it from the local state.
   */
  deleteWorkout: async (id) => {
    try {
      await workoutService.deleteWorkout(id);
      set((state) => ({
        workouts: state.workouts.filter((w) => w._id !== id),
      }));
      return true; // Return success status
    } catch (error) {
      console.error(error);
      return false;
    }
  },
}));

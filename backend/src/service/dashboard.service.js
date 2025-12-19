import { getDailyLog } from "./diary.service.js";
import { getUserProfile } from "./user.service.js";
import User from "../models/user.model.js";
import Workout from "../models/workout.model.js"; // Import the new Workout model

/**
 * Aggregates data for the dashboard, including nutritional progress, weight trends,
 * and workout consistency based on the new Workout model.
 */
export const getDashboardData = async (userId, date = new Date()) => {
  const profileData = await getUserProfile(userId);
  const dailyLog = await getDailyLog(userId, date);

  const safeTotals = dailyLog?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const safeMeals = dailyLog?.meals || [];

  const calorieTarget = profileData.profile?.dailyCalorieTarget || 2000;
  const caloriesConsumed = safeTotals.calories;

  // --- Weight Logic (Same as before) ---
  let weightData = {
    current: profileData.profile?.weight || 0,
    change: 0,
    trend: "neutral",
  };

  try {
    const user = await User.findById(userId).select("weightHistory profile");
    if (user && user.weightHistory && user.weightHistory.length > 0) {
      const sortedHistory = user.weightHistory.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      weightData.current = sortedHistory[0].weight;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const prevWeightEntry = sortedHistory.find(
        (entry) => new Date(entry.date) <= oneWeekAgo
      );
      if (prevWeightEntry) {
        const diff = weightData.current - prevWeightEntry.weight;
        weightData.change = parseFloat(diff.toFixed(1));
        if (diff > 0) weightData.trend = "up";
        else if (diff < 0) weightData.trend = "down";
      }
    }
  } catch (err) {
    console.error("Error calculating weight trends:", err);
  }

  // --- Workout Summary Logic (Updated for new Model) ---

  // Calculate the start of the current week (assuming week starts on Sunday)
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
  startOfWeek.setDate(today.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  // Count workouts created by this user since the start of the week
  const workoutsCompletedCount = await Workout.countDocuments({
    userId,
    date: { $gte: startOfWeek },
  });

  // Calculate the next workout (Logic: Find the first workout scheduled for the future)
  // Or simply display "Today" if a workout exists for today, else "Tomorrow" as placeholder
  // For now, let's keep it simple or fetch the actual next workout if you have a scheduling feature.
  // We'll stick to basic display logic for now.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const hasWorkoutToday = await Workout.exists({
    userId,
    date: { $gte: todayStart, $lte: todayEnd },
  });

  const workoutSummary = {
    workoutsCompleted: workoutsCompletedCount,
    target: 3, // This could be moved to the user profile later
    nextWorkout: hasWorkoutToday ? "Done today!" : "Plan for tomorrow",
  };

  return {
    headerData: {
      calorieTarget,
      caloriesConsumed,
      profileName: profileData.fullName,
    },
    weightData,
    dailySummary: {
      totals: safeTotals,
      logDetails: safeMeals,
    },
    workoutSummary,
  };
};

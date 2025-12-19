import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useDashboardStore = create((set) => ({
  dashboardData: null, // Initialized as null to detect if data is pending
  isLoading: false,
  error: null,

  /**
   * Fetches aggregated dashboard metrics for a given date.
   */
  fetchDashboardData: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const params = date ? { date } : {};
      const response = await axiosInstance.get("/dashboard", { params });

      // Expected response: { success: true, data: { headerData, dailySummary, workoutSummary, weightData } }
      set({ dashboardData: response.data.data });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      set({ error: "Failed to fetch dashboard data" });
    } finally {
      set({ isLoading: false });
    }
  },
}));

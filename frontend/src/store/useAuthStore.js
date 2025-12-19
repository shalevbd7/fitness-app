import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import * as profileService from "../services/profileService.js";

/**
 * Helper function to extract user data from various response structures.
 */
const extractUser = (data) => {
  if (!data) return null;
  if (data.email) return data;
  if (data.user && data.user.email) return data.user;
  if (data.profile && data.profile.email) return data.profile;
  return null;
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  isFetchingProfile: false,
  isLoggingIn: false,
  isSigningUp: false,

  /**
   * Verifies the current session on application load.
   */
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: extractUser(res.data) });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  /**
   * Refreshes the user profile data from the server.
   */
  fetchUserProfile: async () => {
    set({ isFetchingProfile: true });
    try {
      const res = await profileService.getUserProfile();
      const user = extractUser(res);
      if (user) {
        set({ authUser: user });
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    } finally {
      set({ isFetchingProfile: false });
    }
  },

  /**
   * Updates user profile settings and synchronizes the local state.
   */
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await profileService.updateUserProfile(data);
      const updatedUser = extractUser(res);

      if (updatedUser) {
        set({ authUser: updatedUser });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const user = extractUser(res.data);
      set({ authUser: user });
      toast.success(`Welcome back, ${user?.fullName}`);
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const user = extractUser(res.data);
      set({ authUser: user });
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  },
}));

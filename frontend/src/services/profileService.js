import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const PROFILE_API = "/profile";

/**
 * Fetches the current user's profile and targets.
 * Expected response: { success: true, profile: { ... } }
 */
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(PROFILE_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/**
 * Updates the user's profile information and nutritional goals.
 * @param {object} profileData - The updated profile object.
 * Expected response: { success: true, user: { ... } }
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.patch(`${PROFILE_API}/update`, {
      profile: profileData,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update profile");
    throw error;
  }
};

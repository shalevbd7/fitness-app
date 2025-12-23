import { getUserProfile, updateProfile } from "../service/user.service.js";

/**
 * Controller to fetch the current user's profile and settings.
 */
export const getProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await getUserProfile(userId);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller to update user profile information and goals.
 */
export const updateProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const updatedUser = await updateProfile(userId, updates);

    // Returns the user object formatted for the AuthStore extractUser method
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

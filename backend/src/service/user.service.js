import User from "../models/user.model.js";

/**
 * Retrieves the user profile and essential dietary targets.
 * * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<Object>} Object containing user identity and profile metadata.
 * @throws {Error} If the user document is not found in the database.
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profile: user.profile,
  };
};

/**
 * Updates user profile information and synchronizes weight history.
 * * This service implements "Double-Nesting Normalization" to handle payloads
 * where the profile data might be wrapped redundantly by the client.
 * * @param {string} userId - The unique identifier of the user.
 * @param {Object} updates - The incoming update payload from req.body.
 * @returns {Promise<Object>} The updated and sanitized user profile object.
 */
export const updateProfile = async (userId, updates) => {
  // Log incoming raw data for debugging purposes
  console.log("Service received updates:", JSON.stringify(updates, null, 2));

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  /**
   * DATA NORMALIZATION LOGIC:
   * Resolves issues where frontend state structure causes deep nesting
   * e.g., { profile: { profile: { weight: 70 } } }
   */
  let dataToUpdate = updates;
  if (updates.profile) {
    // Dig deeper if the 'profile' key contains another 'profile' key
    dataToUpdate = updates.profile.profile || updates.profile;
  }

  console.log("Normalized data used for update:", dataToUpdate);

  // --- 1. Weight Tracking & History ---
  // If weight is provided, compare with current value before pushing to history array
  if (dataToUpdate.weight !== undefined) {
    const newWeight = Number(dataToUpdate.weight);

    if (user.profile.weight !== newWeight) {
      user.weightHistory.push({
        weight: newWeight,
        date: new Date(),
      });
      user.profile.weight = newWeight;
    }
  }

  // --- 2. Dynamic Profile Updates ---
  // Whitelist of allowed keys to prevent unauthorized field injection
  const allowedFields = [
    "height",
    "age",
    "gender",
    "dailyCalorieTarget",
    "dailyProteinTarget",
    "dailyCarbTarget",
    "dailyFatTarget",
    "theme",
  ];

  allowedFields.forEach((field) => {
    if (dataToUpdate[field] !== undefined) {
      user.profile[field] = dataToUpdate[field];
    }
  });

  // --- 3. Root Level Theme Fallback ---
  // Support theme updates sent directly at the root of the update object
  if (updates.theme) {
    user.profile.theme = updates.theme;
  }

  /**
   * DATABASE SYNCHRONIZATION:
   * Explicitly notify Mongoose about nested object modifications.
   * This ensures the 'save' middleware correctly detects changes in the 'profile' sub-document.
   */
  user.markModified("profile");

  await user.save();

  // Return formatted data consistent with the getProfileController output
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profile: user.profile,
  };
};

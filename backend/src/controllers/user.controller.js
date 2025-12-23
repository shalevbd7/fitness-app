import User from "../models/user.model.js";

/**
 * Retrieves the basic user profile and dietary targets, excluding sensitive data.
 * * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {Promise<Object>} The sanitized user object containing profile details.
 * @throws {Error} If the user is not found.
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
 * Updates user profile details, tracks weight history, and handles UI preferences.
 * * This service handles data normalization to support different payload structures
 * (flat objects vs. nested 'profile' objects) and ensures historical data integrity.
 * * @param {string} userId - The MongoDB ObjectId of the user.
 * @param {Object} updates - The update payload (can be flat or nested under 'profile').
 * @returns {Promise<Object>} The updated and sanitized user profile.
 * @throws {Error} If the user is not found.
 */
export const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Data Normalization:
  // Determine if the incoming data is wrapped in a 'profile' property or sent as a flat object.
  // This ensures the service works regardless of how the frontend structures the request.
  const dataToUpdate = updates.profile || updates;

  // --- 1. Weight History Management ---
  // We only modify the history if a weight value is provided and it differs from the current weight.
  if (dataToUpdate.weight !== undefined) {
    const newWeight = Number(dataToUpdate.weight);

    // Strict comparison to prevent duplicate history entries for the same weight
    if (user.profile.weight !== newWeight) {
      user.weightHistory.push({
        weight: newWeight,
        date: new Date(),
      });

      // Update the current reference weight
      user.profile.weight = newWeight;
    }
  }

  // --- 2. Dynamic Field Updates ---
  // whitelist of fields allowed to be updated directly in the profile object.
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

  // Iterate over allowed fields to update them if present in the payload
  allowedFields.forEach((field) => {
    if (dataToUpdate[field] !== undefined) {
      user.profile[field] = dataToUpdate[field];
    }
  });

  // --- 3. Root Level / Specific Theme Handling ---
  // Handle 'theme' if it was sent at the root level of the update object
  if (updates.theme) {
    user.profile.theme = updates.theme;
  }

  // Notify Mongoose that the nested 'profile' object has been modified.
  // This is crucial for mixed types or nested objects to ensure the 'save' hook triggers correctly.
  user.markModified("profile");

  await user.save();

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profile: user.profile,
  };
};

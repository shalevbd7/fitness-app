import User from "../models/user.model.js";

/**
 * Retrieves the basic user profile and dietary targets, excluding sensitive data.
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
 */
export const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Handle Weight History: Log an entry if the weight value has changed
  if (updates.profile && updates.profile.weight) {
    const newWeight = Number(updates.profile.weight);
    if (user.profile.weight !== newWeight) {
      user.weightHistory.push({
        weight: newWeight,
        date: new Date(),
      });
    }
  }

  // Handle Theme updates
  if (updates.theme) {
    user.profile.theme = updates.theme;
  }

  // Update specific profile target fields
  if (updates.profile) {
    const p = updates.profile;
    if (p.weight !== undefined) user.profile.weight = p.weight;
    if (p.height !== undefined) user.profile.height = p.height;
    if (p.age !== undefined) user.profile.age = p.age;
    if (p.dailyCalorieTarget !== undefined)
      user.profile.dailyCalorieTarget = p.dailyCalorieTarget;
    if (p.dailyProteinTarget !== undefined)
      user.profile.dailyProteinTarget = p.dailyProteinTarget;
    if (p.dailyCarbTarget !== undefined)
      user.profile.dailyCarbTarget = p.dailyCarbTarget;
    if (p.dailyFatTarget !== undefined)
      user.profile.dailyFatTarget = p.dailyFatTarget;
  }

  // Explicitly notify Mongoose about the nested object update
  user.markModified("profile");

  await user.save();

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profile: user.profile,
  };
};

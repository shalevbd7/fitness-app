import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/utils.js";

/**
 * Handles user registration, password hashing, and database storage.
 */
export const signupService = async (email, fullName, password) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    email,
    fullName,
    password: hashedPassword,
  });

  await newUser.save();

  return {
    _id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
  };
};

/**
 * Validates user credentials during login.
 */
export const loginService = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
  };
};

/**
 * Wrapper to trigger JWT token generation and cookie setting.
 */
export const generateTokenAndCookies = (userId, res) => {
  generateToken(userId, res);
};

/**
 * Formats the authenticated user data for client-side use.
 */
export const checkAuthService = (user) => {
  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
  };
};

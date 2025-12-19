import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getProfileController,
  updateProfileController,
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * User Profile Routes
 * All routes are protected by authentication middleware
 */
router.use(protectRoute);

// GET - Retrieve current user profile and targets
router.get("/", getProfileController);

// PATCH - Update user profile settings (weight, goals, theme, etc.)
router.patch("/update", updateProfileController);

export default router;

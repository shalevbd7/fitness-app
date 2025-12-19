import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getWorkoutsController,
  addWorkoutController,
  deleteWorkoutController,
  updateWorkoutController,
} from "../controllers/workout.controller.js";

const router = express.Router();

// Apply authentication middleware to all workout routes
router.use(protectRoute);

// GET /api/workouts?date=YYYY-MM-DD
router.get("/", getWorkoutsController);

// POST /api/workouts/add
router.post("/add", addWorkoutController);

// PATCH /api/workouts/:id
router.patch("/:id", updateWorkoutController);

// DELETE /api/workouts/:id
router.delete("/:id", deleteWorkoutController);

export default router;

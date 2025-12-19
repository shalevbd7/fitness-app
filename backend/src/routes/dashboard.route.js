import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getDashboardController } from "../controllers/dashboard.controller.js";

const router = express.Router();

/**
 * GET /api/dashboard
 * Retrieves aggregated user data for the dashboard view
 */
router.get("/", protectRoute, getDashboardController);

export default router;

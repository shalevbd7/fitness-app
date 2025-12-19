import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getLogController,
  addCompositeFoodController,
  addFoodItemController,
  deleteItemController,
  updateItemController,
} from "../controllers/diary.controller.js";

const router = express.Router();

/**
 * All diary routes require authentication
 */
router.use(protectRoute);

/**
 * Diary Management Routes
 */
router.get("/", getLogController);
router.post("/add-item", addFoodItemController);
router.post("/add-composite", addCompositeFoodController);
router.patch("/item/:itemId", updateItemController);
router.delete("/item/:itemId", deleteItemController);

export default router;

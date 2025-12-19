import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  updateProductController,
} from "../controllers/product.controller.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/**
 * Product Catalog Routes
 */

// POST - Create a new product (Custom or Global)
router.post("/create", protectRoute, createProductController);

// GET - Retrieve all available products
router.get("/", protectRoute, getAllProductsController);

// PATCH - Update an existing product by ID
router.patch("/:id", protectRoute, updateProductController);

// DELETE - Remove a product by ID
router.delete("/:id", protectRoute, deleteProductController);

export default router;

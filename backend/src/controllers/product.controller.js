import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../service/product.service.js";

/**
 * Creates a new food product entry.
 */
export const createProductController = async (req, res) => {
  try {
    const { name, valuesPer100g, isGlobal } = req.body;
    const userId = req.user._id;

    if (
      !name ||
      !valuesPer100g ||
      !valuesPer100g.protein ||
      !valuesPer100g.calories
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = await createProduct(
      { name, valuesPer100g },
      userId,
      isGlobal
    );

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.log("Error in createProductController:", error.message);
    const status =
      error.message.includes("exist") || error.message.includes("non-negative")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * Fetches all products (Global and User-Specific).
 */
export const getAllProductsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const products = await getAllProducts(userId);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log("Error in getAllProductsController:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Updates product details, verifying ownership.
 */
export const updateProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const userId = req.user;

    const updatedProduct = await updateProduct(productId, updates, userId);

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    const status =
      error.message.includes("Unauthorized") ||
      error.message.includes("not found") ||
      error.message.includes("exist") ||
      error.message.includes("non-negative")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * Deletes a product entry.
 */
export const deleteProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user;

    const result = await deleteProduct(productId, userId);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    const status =
      error.message.includes("Unauthorized") ||
      error.message.includes("not found")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

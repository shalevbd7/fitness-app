import Product from "../models/product.model.js";

/**
 * Calculates final nutritional values based on the consumed amount and unit type.
 * Ensures accuracy for weight-based (100g/ml) vs item-based (unit) products.
 */
export const calculateNutritionalValues = (
  valuesPer100g,
  amountConsumed,
  unit = "gram"
) => {
  if (amountConsumed <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  let ratio;

  // Calculation Logic:
  // For 'unit': amountConsumed 1 = 100% of defined nutritional values.
  // For 'gram'/'ml': amountConsumed 100 = 100% (hence divided by 100).
  if (unit === "unit") {
    ratio = amountConsumed;
  } else {
    ratio = amountConsumed / 100;
  }

  const calculatedValues = {
    calories: Math.round(valuesPer100g.calories * ratio),
    protein: Math.round(valuesPer100g.protein * ratio * 10) / 10,
    carbs: Math.round(valuesPer100g.carbs * ratio * 10) / 10,
    fat: Math.round(valuesPer100g.fat * ratio * 10) / 10,
  };
  return calculatedValues;
};

/**
 * Creates a new product, distinguishing between user-specific custom items and global admin items.
 */
export const createProduct = async (
  productData,
  currentUserId,
  isGlobalRequest = false
) => {
  const { name, valuesPer100g, unit } = productData;

  if (valuesPer100g.calories < 0 || valuesPer100g.protein < 0) {
    throw new Error("Nutritional values must be non-negative.");
  }

  const existingProduct = await Product.findOne({
    name,
    createdBy: currentUserId,
  });
  if (existingProduct) {
    throw new Error("A product with this name already exists for this user.");
  }

  const finalIsCustom = !isGlobalRequest;

  if (!finalIsCustom) {
    const existingGlobalProduct = await Product.findOne({
      name,
      isCustom: false,
    });
    if (existingGlobalProduct) {
      throw new Error("A global product with this name already exists.");
    }
  } else {
    const existingPersonalProduct = await Product.findOne({
      name,
      isCustom: true,
      createdBy: currentUserId,
    });

    if (existingPersonalProduct) {
      throw new Error("A personal product with this name already exists.");
    }
  }

  const newProduct = new Product({
    name,
    valuesPer100g,
    unit: unit || "gram",
    isCustom: finalIsCustom,
    createdBy: currentUserId,
  });

  await newProduct.save();

  return newProduct;
};

/**
 * Retrieves a combined list of global products and the user's personal custom products.
 */
export const getAllProducts = async (userId) => {
  const products = await Product.find({
    $or: [{ isCustom: false }, { createdBy: userId, isCustom: true }],
  }).sort({ name: 1 });

  return products;
};

/**
 * Updates an existing product. Validates ownership and ensures no name collisions.
 */
export const updateProduct = async (productId, updates, requestingUser) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const userIdStr = requestingUser._id.toString();
  const creatorIdStr = product.createdBy?.toString();
  const isAdmin = requestingUser.role === "admin";

  if (!isAdmin && creatorIdStr !== userIdStr) {
    throw new Error("Unauthorized: You can only update products you created.");
  }

  if (updates.name && updates.name !== product.name) {
    const duplicateCheck = await Product.findOne({
      name: updates.name,
      createdBy: creatorIdStr,
      isCustom: product.isCustom,
      _id: { $ne: productId },
    });

    if (duplicateCheck) {
      throw new Error("Another product with this name already exists.");
    }
  }

  if (updates.valuesPer100g) {
    updates.valuesPer100g = {
      ...product.valuesPer100g.toObject(),
      ...updates.valuesPer100g,
    };

    if (
      updates.valuesPer100g.calories < 0 ||
      updates.valuesPer100g.protein < 0
    ) {
      throw new Error("Nutritional values must be non-negative.");
    }
  }

  product.set(updates);
  await product.save();
  return product;
};

/**
 * Deletes a product if the user is the creator or an administrator.
 */
export const deleteProduct = async (productId, currentUser) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const creatorId = product.createdBy?.toString();
  const currentUserIdStr = currentUser._id.toString();
  const isAdminUser = currentUser.role === "admin";

  const isAuthorized =
    isAdminUser || (creatorId && creatorId === currentUserIdStr);

  if (!isAuthorized) {
    if (!creatorId) {
      throw new Error(
        "Unauthorized: This product is a core system item and cannot be deleted."
      );
    }
    throw new Error("Unauthorized: You can only delete products you created.");
  }

  await Product.deleteOne({ _id: productId });

  return { message: "Product deleted successfully." };
};

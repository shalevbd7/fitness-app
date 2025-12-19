import {
  getDailyLog,
  addFoodItem,
  addCompositeFood,
  updateFoodItem,
  removeFoodItem,
} from "../service/diary.service.js";

/**
 * Retrieves the daily log for a specific user and date.
 */
export const getLogController = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    const userId = req.user._id;

    const log = await getDailyLog(userId, date);
    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Adds a standard food item to the diary.
 */
export const addFoodItemController = async (req, res) => {
  try {
    const { date, mealType, productId, amount } = req.body;
    const userId = req.user._id;

    const updatedLog = await addFoodItem(
      userId,
      date,
      mealType,
      productId,
      amount
    );

    res.status(200).json({ success: true, log: updatedLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Adds a composite food (multi-ingredient) to the diary.
 */
export const addCompositeFoodController = async (req, res) => {
  try {
    const { date, mealType, name, ingredients } = req.body;
    const userId = req.user._id;

    const updatedLog = await addCompositeFood(
      userId,
      date,
      mealType,
      name,
      ingredients
    );
    res.status(200).json({ success: true, log: updatedLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Deletes a food item from a specific meal in the log.
 */
export const deleteItemController = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { date, mealType } = req.body; // Requires date and meal type to locate the item
    const userId = req.user._id;

    const updatedLog = await removeFoodItem(userId, date, mealType, itemId);
    res.status(200).json({ success: true, log: updatedLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Updates the quantity or details of an existing food item in the diary.
 */
export const updateItemController = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { date, mealType, amount } = req.body;
    const userId = req.user._id;

    const updatedLog = await updateFoodItem(
      userId,
      date,
      mealType,
      itemId,
      amount
    );
    res.status(200).json({ success: true, log: updatedLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

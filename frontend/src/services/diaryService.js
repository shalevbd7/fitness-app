import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const DIARY_API = "/diary";

/**
 * Retrieves the daily food log for a specific date.
 * @param {string} date - ISO date string (YYYY-MM-DD).
 */
export const getDailyLog = async (date) => {
  try {
    const response = await axiosInstance.get(DIARY_API, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching log:", error);
    throw error;
  }
};

/**
 * Adds a single food product to a specific meal in the log.
 * @param {object} itemData - Includes { date, mealType, productId, amount }.
 */
export const addFoodItem = async (itemData) => {
  try {
    const response = await axiosInstance.post(
      `${DIARY_API}/add-item`,
      itemData
    );
    toast.success("Food item added!");
    return response.data;
  } catch (error) {
    toast.error("Error adding food item.");
    throw error;
  }
};

/**
 * Adds a composite meal (multiple ingredients) to the log.
 * @param {object} compositeData - Includes { date, mealType, name, ingredients }.
 */
export const addCompositeFood = async (compositeData) => {
  try {
    const response = await axiosInstance.post(
      `${DIARY_API}/add-composite`,
      compositeData
    );
    toast.success("Meal created & added!");
    return response.data;
  } catch (error) {
    toast.error("Error adding composite meal.");
    throw error;
  }
};

/**
 * Updates the quantity or details of an existing log item.
 * @param {string} date - Log date.
 * @param {string} mealType - breakfast/lunch/dinner/snack.
 * @param {string} itemId - Unique item ID.
 * @param {number|object} amount - New quantity or updated ingredients.
 */
export const updateFoodItem = async (date, mealType, itemId, amount) => {
  try {
    const response = await axiosInstance.patch(`${DIARY_API}/item/${itemId}`, {
      date,
      mealType,
      amount,
    });
    toast.success("Item updated successfully");
    return response.data;
  } catch (error) {
    toast.error("Error updating item.");
    throw error;
  }
};

/**
 * Removes a food item from the daily log.
 * @param {string} date - Log date.
 * @param {string} mealType - Meal category.
 * @param {string} itemId - Item to delete.
 */
export const deleteFoodItem = async (date, mealType, itemId) => {
  try {
    const response = await axiosInstance.delete(`${DIARY_API}/item/${itemId}`, {
      data: { date, mealType },
    });
    toast.success("Item removed.");
    return response.data;
  } catch (error) {
    toast.error("Error deleting item.");
    throw error;
  }
};

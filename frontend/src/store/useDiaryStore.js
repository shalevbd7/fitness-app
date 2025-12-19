import { create } from "zustand";
import * as diaryService from "../services/diaryService";

export const useDiaryStore = create((set, get) => ({
  currentLog: null,
  currentDate: new Date().toISOString().split("T")[0],
  isLoading: false,

  /**
   * Updates the selected date and triggers a fresh log fetch.
   */
  setCurrentDate: (newDate) => {
    set({ currentDate: newDate });
    get().fetchDiary(newDate);
  },

  /**
   * Fetches the food log for the specific date from the diary service.
   */
  fetchDiary: async (date) => {
    const dateToFetch = date || get().currentDate;
    set({ isLoading: true });
    try {
      const data = await diaryService.getDailyLog(dateToFetch);
      if (data.log) {
        set({ currentLog: data.log });
      }
    } catch (error) {
      // Initialize with empty state on failure or non-existent log
      set({
        currentLog: {
          meals: {
            breakfast: { items: [] },
            lunch: { items: [] },
            dinner: { items: [] },
            snack: { items: [] },
          },
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Dispatches a request to add a standard food item.
   */
  addFoodItem: async (mealType, productId, amount) => {
    const date = get().currentDate;
    try {
      const res = await diaryService.addFoodItem({
        date,
        mealType,
        productId,
        amount,
      });
      if (res.log) set({ currentLog: res.log });
      return true;
    } catch (error) {
      console.error("Add food item error:", error);
      return false;
    }
  },

  /**
   * Dispatches a request to add a composite meal with multiple ingredients.
   */
  addCompositeFood: async (mealType, name, ingredients) => {
    const date = get().currentDate;
    try {
      const res = await diaryService.addCompositeFood({
        date,
        mealType,
        name,
        ingredients,
      });
      if (res.log) set({ currentLog: res.log });
      return true;
    } catch (error) {
      console.error("Add composite food error:", error);
      return false;
    }
  },

  /**
   * Updates quantity or contents of a specific log entry.
   */
  updateFoodItem: async (date, mealType, itemId, newAmount) => {
    try {
      const res = await diaryService.updateFoodItem(
        date,
        mealType,
        itemId,
        newAmount
      );
      if (res.log) set({ currentLog: res.log });
      return true;
    } catch (error) {
      console.error("Update food item error:", error);
      return false;
    }
  },

  /**
   * Removes an entry from the user's daily log.
   */
  deleteFoodItem: async (date, mealType, itemId) => {
    try {
      const res = await diaryService.deleteFoodItem(date, mealType, itemId);
      if (res.log) set({ currentLog: res.log });
      return true;
    } catch (error) {
      console.error("Delete food item error:", error);
      return false;
    }
  },
}));

import DailyLog from "../models/dailyLog.model.js";
import Product from "../models/product.model.js";
import { calculateNutritionalValues } from "./product.service.js";

/**
 * Retrieves an existing log or creates a new one for the specified date.
 */
const getOrCreateLog = async (userId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let log = await DailyLog.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!log) {
    log = new DailyLog({
      userId,
      date: startOfDay,
      meals: {
        breakfast: { items: [] },
        lunch: { items: [] },
        dinner: { items: [] },
        snack: { items: [] },
      },
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    });
    await log.save();
  }
  return log;
};

/**
 * Sums up all meal items to update the daily nutritional totals.
 */
const recalculateDailyTotals = (log) => {
  const newTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  ["breakfast", "lunch", "dinner", "snack"].forEach((mealType) => {
    log.meals[mealType].items.forEach((item) => {
      newTotals.calories += item.calculatedValues.calories;
      newTotals.protein += item.calculatedValues.protein;
      newTotals.carbs += item.calculatedValues.carbs;
      newTotals.fat += item.calculatedValues.fat;
    });
  });
  log.totals.calories = Math.round(newTotals.calories);
  log.totals.protein = Math.round(newTotals.protein * 10) / 10;
  log.totals.carbs = Math.round(newTotals.carbs * 10) / 10;
  log.totals.fat = Math.round(newTotals.fat * 10) / 10;
  return log;
};

/**
 * Adds a single product to a specific meal in the daily log.
 */
export const addFoodItem = async (
  userId,
  date,
  mealType,
  productId,
  amount
) => {
  const log = await getOrCreateLog(userId, date);
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  // Calculate values based on product unit (gram/ml/unit)
  const itemValues = calculateNutritionalValues(
    product.valuesPer100g,
    amount,
    product.unit
  );

  const newItem = {
    foodId: product._id,
    name: product.name,
    amountConsumed: amount,
    unit: product.unit || "gram",
    calculatedValues: itemValues,
  };

  log.meals[mealType].items.push(newItem);
  recalculateDailyTotals(log);
  await log.save();
  return log;
};

/**
 * Adds a composite meal (multiple ingredients) to the daily log.
 */
export const addCompositeFood = async (
  userId,
  date,
  mealType,
  name,
  ingredients
) => {
  const log = await getOrCreateLog(userId, date);

  const totalCompositeValues = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let totalWeight = 0;
  const processedIngredients = [];

  for (const ingredient of ingredients) {
    const product = await Product.findById(ingredient.productId);
    if (!product) continue;

    const values = calculateNutritionalValues(
      product.valuesPer100g,
      ingredient.amount,
      product.unit
    );

    totalCompositeValues.calories += values.calories;
    totalCompositeValues.protein += values.protein;
    totalCompositeValues.carbs += values.carbs;
    totalCompositeValues.fat += values.fat;

    totalWeight += parseFloat(ingredient.amount);

    processedIngredients.push({
      productId: product._id,
      name: product.name,
      amount: ingredient.amount,
      unit: product.unit || "gram",
    });
  }

  const newItem = {
    name: name,
    amountConsumed: totalWeight,
    ingredients: processedIngredients,
    calculatedValues: {
      calories: Math.round(totalCompositeValues.calories),
      protein: Math.round(totalCompositeValues.protein * 10) / 10,
      carbs: Math.round(totalCompositeValues.carbs * 10) / 10,
      fat: Math.round(totalCompositeValues.fat * 10) / 10,
    },
  };

  log.meals[mealType].items.push(newItem);
  recalculateDailyTotals(log);
  await log.save();
  return log;
};

/**
 * Removes a food item from the daily log by its unique item ID.
 */
export const removeFoodItem = async (userId, date, mealType, itemId) => {
  const log = await getOrCreateLog(userId, date);
  log.meals[mealType].items = log.meals[mealType].items.filter(
    (item) => item._id.toString() !== itemId
  );

  recalculateDailyTotals(log);
  await log.save();

  return log;
};

export const getDailyLog = async (userId, date) => {
  return await getOrCreateLog(userId, date);
};

/**
 * Updates an existing food item's amount or ingredients and recalculates nutritional impact.
 */
export const updateFoodItem = async (
  userId,
  date,
  mealType,
  itemId,
  updateData
) => {
  const log = await getOrCreateLog(userId, date);
  const mealItems = log.meals[mealType].items;
  const itemIndex = mealItems.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) throw new Error("Item not found");

  const item = mealItems[itemIndex];

  // Case 1: Updating ingredients within a composite meal
  if (
    updateData.ingredients &&
    item.ingredients &&
    item.ingredients.length > 0
  ) {
    const newIngredients = updateData.ingredients;
    let totalCals = 0,
      totalP = 0,
      totalC = 0,
      totalF = 0;
    let totalWeight = 0;

    for (const ing of newIngredients) {
      const product = await Product.findById(ing.productId);
      if (product) {
        const vals = calculateNutritionalValues(
          product.valuesPer100g,
          ing.amount,
          product.unit
        );
        totalCals += vals.calories;
        totalP += vals.protein;
        totalC += vals.carbs;
        totalF += vals.fat;
        totalWeight += Number(ing.amount);
      }
    }

    item.ingredients = newIngredients;
    item.amountConsumed = totalWeight;
    item.calculatedValues = {
      calories: Math.round(totalCals),
      protein: Math.round(totalP * 10) / 10,
      carbs: Math.round(totalC * 10) / 10,
      fat: Math.round(totalF * 10) / 10,
    };
  }

  // Case 2: Updating amount for a standard product
  else if (updateData.amount || typeof updateData === "number") {
    const newAmount = updateData.amount || updateData;

    if (item.foodId) {
      const product = await Product.findById(item.foodId);
      if (product) {
        const newValues = calculateNutritionalValues(
          product.valuesPer100g,
          newAmount,
          product.unit
        );
        item.amountConsumed = newAmount;
        item.calculatedValues = newValues;
      }
    } else {
      // Legacy fallback: Linear calculation if original product reference is missing
      const ratio = newAmount / item.amountConsumed;
      item.amountConsumed = newAmount;
      item.calculatedValues.calories = Math.round(
        item.calculatedValues.calories * ratio
      );
      item.calculatedValues.protein =
        Math.round(item.calculatedValues.protein * ratio * 10) / 10;
      item.calculatedValues.carbs =
        Math.round(item.calculatedValues.carbs * ratio * 10) / 10;
      item.calculatedValues.fat =
        Math.round(item.calculatedValues.fat * ratio * 10) / 10;
    }
  }

  recalculateDailyTotals(log);
  await log.save();
  return log;
};

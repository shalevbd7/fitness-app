import React, { useState } from "react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { X, Trash2, Edit2, Save, Flame, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const MealModal = ({ isOpen, onClose, mealType, mealData, date }) => {
  const { deleteFoodItem, updateFoodItem } = useDiaryStore();
  const [editingItemId, setEditingItemId] = useState(null);

  /**
   * Returns a displayable title for each meal category.
   */
  const getTitle = (type) => {
    const titles = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snacks",
    };
    return titles[type] || type;
  };

  /**
   * Aggregates total nutritional values for the displayed meal.
   */
  const totals = mealData?.items?.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calculatedValues.calories,
      protein: acc.protein + item.calculatedValues.protein,
      carbs: acc.carbs + item.calculatedValues.carbs,
      fat: acc.fat + item.calculatedValues.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-md h-[85vh] sm:h-auto sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header and Macro Summary */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-100 z-10">
          <div>
            <h2 className="text-2xl font-bold">{getTitle(mealType)}</h2>
            <div className="flex gap-3 text-xs opacity-70 mt-1">
              <span className="font-bold text-warning">
                {Math.round(totals.calories)} kcal
              </span>
              <span>P: {totals.protein.toFixed(1)}g</span>
              <span>C: {totals.carbs.toFixed(1)}g</span>
              <span>F: {totals.fat.toFixed(1)}g</span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X size={24} />
          </button>
        </div>

        {/* Meal Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mealData?.items?.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p>No items in this meal yet.</p>
            </div>
          ) : (
            mealData.items.map((item) => (
              <MealItemRow
                key={item._id}
                item={item}
                isEditing={editingItemId === item._id}
                onEdit={() => setEditingItemId(item._id)}
                onCancelEdit={() => setEditingItemId(null)}
                onDelete={() => deleteFoodItem(date, mealType, item._id)}
                onSave={async (updateData) => {
                  await updateFoodItem(date, mealType, item._id, updateData);
                  setEditingItemId(null);
                }}
              />
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-base-200 bg-base-50">
          <button onClick={onClose} className="btn btn-block">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Sub-component for individual meal rows, handling both display and edit modes.
 */
const MealItemRow = ({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
  onSave,
}) => {
  const isComposite = item.ingredients && item.ingredients.length > 0;

  const [amount, setAmount] = useState(item.amountConsumed);
  const [ingredients, setIngredients] = useState(item.ingredients || []);

  /**
   * Determines unit display based on product data with backward compatibility.
   */
  const getUnitDisplay = (itm) => {
    if (itm.unit) {
      switch (itm.unit) {
        case "unit":
          return "units";
        case "ml":
          return "ml";
        case "gram":
        default:
          return "g";
      }
    }
    return itm.amountConsumed < 10 ? "units" : "g";
  };

  const handleSave = () => {
    if (isComposite) {
      onSave({ ingredients: ingredients });
    } else {
      if (amount <= 0) return toast.error("Amount must be greater than 0");
      onSave({ amount: amount });
    }
  };

  const handleIngredientChange = (index, newVal) => {
    const newIngredients = [...ingredients];
    newIngredients[index].amount = Number(newVal);
    setIngredients(newIngredients);
  };

  // --- Edit Mode Interface ---
  if (isEditing) {
    return (
      <div className="bg-base-200 rounded-xl p-3 animate-in fade-in border border-primary/20">
        <div className="flex justify-between items-center mb-3 border-b border-base-content/10 pb-2">
          <span className="font-bold text-sm">{item.name}</span>
          <div className="flex gap-1">
            <button
              onClick={onCancelEdit}
              className="btn btn-ghost btn-xs btn-square text-error"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-xs btn-square"
            >
              <Save size={16} />
            </button>
          </div>
        </div>

        {isComposite ? (
          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="opacity-70 w-1/2 truncate">{ing.name}</span>
                <div className="flex items-center gap-1 w-1/2 justify-end">
                  <input
                    type="number"
                    value={ing.amount}
                    onChange={(e) =>
                      handleIngredientChange(idx, e.target.value)
                    }
                    className="input input-xs input-bordered w-16 text-center"
                  />
                  <span className="opacity-50 w-8">{getUnitDisplay(ing)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-sm">Quantity:</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input input-sm input-bordered w-24 text-center"
              autoFocus
            />
            <span className="text-xs opacity-50">{getUnitDisplay(item)}</span>
          </div>
        )}
      </div>
    );
  }

  // --- Standard Display Interface ---
  return (
    <div className="flex flex-col bg-base-100 border border-base-200 rounded-xl hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary relative">
            <Flame size={18} />
            {isComposite && (
              <span className="absolute -bottom-1 -right-1 bg-base-100 rounded-full border border-base-200 p-[1px]">
                <ChevronDown size={8} />
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm">{item.name}</h4>
            <p className="text-xs opacity-60">
              {isComposite
                ? `${item.ingredients.length} ingredients`
                : `${item.amountConsumed} ${getUnitDisplay(item)}`}
              {" • "}
              {Math.round(item.calculatedValues.calories)} kcal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="btn btn-ghost btn-xs btn-square">
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealModal;

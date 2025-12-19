import React, { useState, useEffect, useMemo } from "react";
import { useProductStore } from "../../store/useProductStore";
import { useDiaryStore } from "../../store/useDiaryStore";
import { X, Search, Plus, Trash2, Calendar, Check, Layers } from "lucide-react";
import toast from "react-hot-toast";

const AddMealModal = ({ isOpen, onClose }) => {
  const { products, fetchProducts } = useProductStore();
  const { addFoodItem, addCompositeFood, currentDate } = useDiaryStore();

  // --- States ---

  // General settings (Date and Meal Type)
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [mealType, setMealType] = useState(determineMealType());

  // Search and selection states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amountInput, setAmountInput] = useState("");

  // Temporary list before saving to database
  const [basket, setBasket] = useState([]);

  // Composite meal logic
  const [isCompositeMode, setIsCompositeMode] = useState(false);
  const [compositeName, setCompositeName] = useState("");

  // Background data fetching when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSelectedDate(currentDate);
      setBasket([]);
      setSearchTerm("");
      setIsCompositeMode(false);
    }
  }, [isOpen, currentDate, fetchProducts]);

  /**
   * Helper function to suggest a meal type based on current local time.
   */
  function determineMealType() {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 16) return "lunch";
    if (hour < 22) return "dinner";
    return "snack";
  }

  /**
   * Filters available products based on the search input (max 5 results).
   */
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [searchTerm, products]);

  // --- Handlers ---

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setAmountInput("");
    setSearchTerm("");
  };

  const handleAddToBasket = (e) => {
    e.preventDefault();
    if (!selectedProduct || !amountInput || Number(amountInput) <= 0) return;

    const newItem = {
      product: selectedProduct,
      amount: Number(amountInput),
      tempId: Date.now(),
    };

    setBasket((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setAmountInput("");
    toast.success(`${selectedProduct.name} added to list`);
  };

  const removeFromBasket = (tempId) => {
    setBasket((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  /**
   * Finalizes the meal entry, handling both individual items and composite meals.
   */
  const handleSaveMeal = async () => {
    if (basket.length === 0) return;

    try {
      if (isCompositeMode) {
        if (!compositeName) return toast.error("Please name your meal");

        const ingredients = basket.map((item) => ({
          productId: item.product._id,
          amount: item.amount,
        }));

        await addCompositeFood(mealType, compositeName, ingredients);
      } else {
        await Promise.all(
          basket.map((item) =>
            addFoodItem(mealType, item.product._id, item.amount)
          )
        );
      }

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save meal");
    }
  };

  /**
   * Formats the unit label based on product configuration.
   */
  const getUnitDisplay = (product) => {
    const unit = product.unit || "gram";
    switch (unit) {
      case "unit":
        return { label: "Units", short: "units" };
      case "ml":
        return { label: "Milliliters", short: "ml" };
      case "gram":
      default:
        return { label: "Grams", short: "g" };
    }
  };

  /**
   * Formats the nutritional basis label (e.g., per 100g).
   */
  const getProductValueLabel = (product) => {
    const unit = product.unit || "gram";
    switch (unit) {
      case "unit":
        return "per unit";
      case "ml":
        return "per 100ml";
      case "gram":
      default:
        return "per 100g";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-2xl h-[90vh] sm:h-auto min-h-[600px] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden transition-all">
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Report Meal</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Global Controls: Date & Meal Type */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-base-200/50">
          <label className="input input-sm input-bordered flex items-center gap-2 cursor-pointer">
            <Calendar size={14} className="opacity-50" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="grow bg-transparent text-sm"
              max={new Date().toISOString().split("T")[0]}
            />
          </label>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="select select-bordered select-sm w-full"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Main Selection Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search Interface */}
          {!selectedProduct && (
            <div className="relative z-20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 size-5" />
                <input
                  type="text"
                  placeholder="Search for food..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus={basket.length === 0}
                />
              </div>

              {/* Dynamic Search Results */}
              {searchResults.length > 0 && (
                <ul className="menu bg-base-100 border border-base-200 rounded-box mt-2 shadow-lg absolute w-full">
                  {searchResults.map((product) => {
                    const unitDisplay = getProductValueLabel(product);
                    return (
                      <li key={product._id}>
                        <button
                          onClick={() => handleProductSelect(product)}
                          className="flex justify-between"
                        >
                          <span>{product.name}</span>
                          <span className="text-xs opacity-50">
                            {product.valuesPer100g.calories} kcal {unitDisplay}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Amount Input Form */}
          {selectedProduct && (
            <form
              onSubmit={handleAddToBasket}
              className="bg-base-200 p-4 rounded-xl animate-in slide-in-from-right-4 fade-in"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                  <p className="text-xs opacity-60">
                    {selectedProduct.valuesPer100g.calories} kcal{" "}
                    {getProductValueLabel(selectedProduct)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="btn btn-ghost btn-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="label py-1">
                    <span className="label-text text-xs">
                      Amount ({getUnitDisplay(selectedProduct).label})
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    className="input input-bordered w-full"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!amountInput}
                  className="btn btn-primary mt-auto"
                >
                  <Plus size={20} /> Add
                </button>
              </div>
            </form>
          )}

          {/* Current Selection Summary */}
          {basket.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs opacity-50 uppercase font-bold tracking-wider">
                <span>Current Meal Items</span>
                <span>{basket.length} items</span>
              </div>

              {basket.map((item) => (
                <div
                  key={item.tempId}
                  className="flex items-center justify-between p-3 bg-base-100 border border-base-200 rounded-xl shadow-sm"
                >
                  <div>
                    <p className="font-bold text-sm">{item.product.name}</p>
                    <p className="text-xs opacity-60">
                      {item.amount} {getUnitDisplay(item.product).short}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromBasket(item.tempId)}
                    className="btn btn-ghost btn-sm btn-square text-error"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-base-200 bg-base-50 space-y-3">
          {basket.length > 1 && (
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={isCompositeMode}
                  onChange={(e) => setIsCompositeMode(e.target.checked)}
                />
                <span className="label-text flex items-center gap-2 font-medium">
                  <Layers size={16} />
                  Group as single meal (Composite)
                </span>
              </label>
            </div>
          )}

          {isCompositeMode && (
            <input
              type="text"
              placeholder="Meal Name (e.g., Green Shake)"
              className="input input-bordered w-full"
              value={compositeName}
              onChange={(e) => setCompositeName(e.target.value)}
            />
          )}

          <button
            onClick={handleSaveMeal}
            disabled={basket.length === 0}
            className="btn btn-primary w-full gap-2 text-lg"
          >
            <Check size={20} />
            Save {isCompositeMode ? "Meal" : `${basket.length} Items`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMealModal;

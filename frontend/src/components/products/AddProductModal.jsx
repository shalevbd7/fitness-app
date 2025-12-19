import React, { useState } from "react";
import { useProductStore } from "../../store/useProductStore";
import {
  X,
  Save,
  Globe,
  Lock,
  Loader,
  Scale,
  Droplet,
  Package,
} from "lucide-react";

/**
 * Modal component for creating a new product.
 * Supports defining nutritional values based on specific measurement units.
 */
const AddProductModal = ({ isOpen, onClose }) => {
  const { createProduct, isLoading } = useProductStore();

  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const [isGlobal, setIsGlobal] = useState(false);
  const [unit, setUnit] = useState("gram"); // Default unit: grams

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Submits the product data to the store/API.
   * Formats the payload to match the backend expectations (valuesPer100g).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProductData = {
      name: formData.name,
      valuesPer100g: {
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fat: Number(formData.fat) || 0,
      },
      unit: unit,
      isGlobal: isGlobal,
    };

    const success = await createProduct(newProductData);

    if (success) {
      // Reset form and close modal on successful creation
      setFormData({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      });
      setIsGlobal(false);
      setUnit("gram");
      onClose();
    }
  };

  /**
   * Returns dynamic text based on the selected unit.
   */
  const getUnitLabel = () => {
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

  const unitOptions = [
    {
      value: "gram",
      label: "Grams (g)",
      icon: Scale,
      description: "Values per 100g",
    },
    {
      value: "ml",
      label: "Milliliters (ml)",
      icon: Droplet,
      description: "Values per 100ml",
    },
    {
      value: "unit",
      label: "Units",
      icon: Package,
      description: "Values per 1 unit",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="modal-box w-full max-w-md relative bg-base-100 shadow-2xl border border-base-300 max-h-[90vh] overflow-y-auto">
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="size-5" />
        </button>

        <h3 className="text-2xl font-bold mb-6">Add New Product</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Identification */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-medium">Product Name</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Banana, Chicken Breast..."
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              autoFocus
              required
            />
          </div>

          {/* Unit Selection Grid */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-medium">Measurement Unit</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {unitOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = unit === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUnit(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-base-300 hover:border-base-400"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs font-medium">
                      {option.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs opacity-60 mt-2">
              {unitOptions.find((o) => o.value === unit)?.description}
            </p>
          </div>

          {/* Nutritional Data Grid */}
          <div>
            <label className="label py-1">
              <span className="label-text font-medium">
                Nutritional Values{" "}
                <span className="text-xs opacity-60">({getUnitLabel()})</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <InputBox
                label="Calories (kcal)"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
              />
              <InputBox
                label="Protein (g)"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
              />
              <InputBox
                label="Carbs (g)"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
              />
              <InputBox
                label="Fat (g)"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Visibility Controls (Public vs Private) */}
          <div className="form-control mt-4">
            <label className="label py-1">
              <span className="label-text font-medium">Visibility</span>
            </label>
            <div
              onClick={() => setIsGlobal(!isGlobal)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                isGlobal
                  ? "bg-secondary/10 border-secondary"
                  : "bg-base-200 border-transparent hover:border-base-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isGlobal
                      ? "bg-secondary text-secondary-content"
                      : "bg-neutral text-neutral-content"
                  }`}
                >
                  {isGlobal ? <Globe size={18} /> : <Lock size={18} />}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold text-sm ${
                      isGlobal ? "text-secondary" : ""
                    }`}
                  >
                    {isGlobal ? "Global Product" : "Private Product"}
                  </span>
                  <span className="text-xs opacity-60">
                    {isGlobal ? "Visible to everyone" : "Only visible to you"}
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                className={`toggle ${
                  isGlobal ? "toggle-secondary" : "toggle-neutral"
                }`}
                checked={isGlobal}
                readOnly
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-action mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin size-5" />
              ) : (
                <Save className="size-5" />
              )}
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Reusable input component for nutritional values.
 */
const InputBox = ({ label, name, value, onChange }) => (
  <div className="form-control">
    <label className="label py-1">
      <span className="label-text text-xs opacity-70">{label}</span>
    </label>
    <input
      type="number"
      step="0.1"
      name={name}
      value={value}
      onChange={onChange}
      className="input input-sm input-bordered w-full"
      placeholder="0"
      required
    />
  </div>
);

export default AddProductModal;

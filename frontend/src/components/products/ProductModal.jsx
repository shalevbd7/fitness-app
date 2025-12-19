import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useProductStore } from "../../store/useProductStore";
import {
  X,
  Trash2,
  Edit2,
  Save,
  Globe,
  Lock,
  Scale,
  Droplet,
  Package,
} from "lucide-react";

/**
 * Modal component for viewing and editing existing product details.
 */
const ProductModal = ({ product, onClose }) => {
  const { authUser } = useAuthStore();
  const { deleteProduct } = useProductStore();

  const isAdmin = authUser?.role === "admin";
  const isOwner = product?.createdBy === authUser?._id;
  const canEdit = isOwner || isAdmin;
  const isGlobal = !product?.isCustom;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!product) return null;

  const handleDelete = async () => {
    const success = await deleteProduct(product._id);
    if (success) onClose();
  };

  const formKey = `${product._id}-${isEditing ? "edit" : "view"}`;
  const productUnit = product.unit || "gram";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="modal-box w-full max-w-md relative bg-base-100 shadow-2xl border border-base-300">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="size-5" />
        </button>

        <div className="mt-2 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {isGlobal ? (
              <div className="badge badge-secondary gap-1">
                <Globe className="size-3" /> Public
              </div>
            ) : (
              <div className="badge badge-neutral gap-1">
                <Lock className="size-3" /> Private
              </div>
            )}
            {isOwner && (
              <div className="badge badge-outline text-xs">My Product</div>
            )}
            <UnitBadge unit={productUnit} />
          </div>

          {!isEditing && <h3 className="text-2xl font-bold">{product.name}</h3>}
        </div>

        <ProductForm
          key={formKey}
          product={product}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          canEdit={canEdit}
          isGlobal={isGlobal}
          productUnit={productUnit}
        />

        {/* Edit and Delete Actions */}
        {canEdit && (
          <div className="border-t border-base-300 pt-4 mt-6">
            {showDeleteConfirm ? (
              <div className="flex items-center justify-between animate-in slide-in-from-left-2 bg-error/10 p-2 rounded-lg">
                <span className="text-xs text-error font-bold ml-2">
                  Delete this product?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-ghost btn-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-error btn-xs text-white"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-ghost btn-sm text-error gap-2 opacity-70 hover:opacity-100"
                >
                  <Trash2 className="size-4" /> Delete Product
                </button>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-neutral btn-sm gap-2"
                  >
                    <Edit2 className="size-4" /> Edit
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!canEdit && (
          <div className="text-center text-xs opacity-40 pt-4 border-t border-base-300 mt-4">
            Read-only view
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Inner form component for handling product updates.
 */
const ProductForm = ({ product, isEditing, setIsEditing, productUnit }) => {
  const { updateProduct } = useProductStore();

  const [formData, setFormData] = useState({
    name: product.name || "",
    calories: product.valuesPer100g.calories || 0,
    protein: product.valuesPer100g.protein || 0,
    carbs: product.valuesPer100g.carbs || 0,
    fat: product.valuesPer100g.fat || 0,
  });

  const [unit, setUnit] = useState(productUnit);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  const handleSave = async () => {
    const updates = {
      name: formData.name,
      valuesPer100g: {
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
      },
      unit: unit,
    };

    const success = await updateProduct(product._id, updates);
    if (success) setIsEditing(false);
  };

  /**
   * Helper to display correct basis label.
   */
  const getUnitLabel = () => {
    switch (productUnit) {
      case "unit":
        return "per unit";
      case "ml":
        return "per 100ml";
      case "gram":
      default:
        return "per 100g";
    }
  };

  // View Mode
  if (!isEditing) {
    return (
      <div>
        <div className="text-xs opacity-60 mb-2 font-medium">
          Nutritional Values ({getUnitLabel()})
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatBox
            label="Calories"
            value={product.valuesPer100g.calories}
            color="text-warning"
          />
          <StatBox
            label="Protein"
            value={`${product.valuesPer100g.protein}g`}
            color="text-primary"
          />
          <StatBox
            label="Carbs"
            value={`${product.valuesPer100g.carbs}g`}
            color="text-secondary"
          />
          <StatBox
            label="Fat"
            value={`${product.valuesPer100g.fat}g`}
            color="text-accent"
          />
        </div>
      </div>
    );
  }

  // Edit Mode
  const unitOptions = [
    { value: "gram", label: "g", icon: Scale },
    { value: "ml", label: "ml", icon: Droplet },
    { value: "unit", label: "unit", icon: Package },
  ];

  return (
    <div className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="input input-bordered w-full font-bold"
        placeholder="Product Name"
      />

      {/* Unit Selection Interface */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-medium">Unit</span>
        </label>
        <div className="flex gap-2">
          {unitOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = unit === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setUnit(option.value)}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 hover:border-base-400"
                }`}
              >
                <Icon className="size-4" />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label py-1">
          <span className="label-text text-xs font-medium">
            Values (
            {unit === "unit"
              ? "per unit"
              : unit === "ml"
              ? "per 100ml"
              : "per 100g"}
            )
          </span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <InputBox
            label="Calories"
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

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setIsEditing(false)}
          className="btn btn-ghost btn-sm"
        >
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary btn-sm gap-2">
          <Save className="size-4" /> Save Changes
        </button>
      </div>
    </div>
  );
};

/**
 * Visual badge to represent the measurement basis.
 */
const UnitBadge = ({ unit }) => {
  const configs = {
    gram: { icon: Scale, text: "100g", color: "badge-info" },
    ml: { icon: Droplet, text: "100ml", color: "badge-accent" },
    unit: { icon: Package, text: "Unit", color: "badge-success" },
  };

  const config = configs[unit] || configs.gram;
  const Icon = config.icon;

  return (
    <div className={`badge ${config.color} gap-1 badge-sm`}>
      <Icon className="size-3" /> {config.text}
    </div>
  );
};

/**
 * Display box for read-only nutritional stats.
 */
const StatBox = ({ label, value, color }) => (
  <div className="stat bg-base-200 rounded-box p-3">
    <div className="stat-title text-xs opacity-70">{label}</div>
    <div className={`stat-value text-lg ${color}`}>{value}</div>
  </div>
);

/**
 * Reusable numeric input for editing product values.
 */
const InputBox = ({ label, name, value, onChange }) => (
  <div className="form-control">
    <label className="label py-1">
      <span className="label-text text-xs">{label}</span>
    </label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className="input input-sm input-bordered w-full"
      step="0.1"
    />
  </div>
);

export default ProductModal;

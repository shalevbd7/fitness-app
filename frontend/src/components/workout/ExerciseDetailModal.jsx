import React, { useState } from "react";
import {
  X,
  Dumbbell,
  Repeat,
  Hash,
  Edit2,
  Trash2,
  Plus,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Modal for viewing, editing, and deleting a specific exercise.
 * * Logic Note:
 * This component initializes its state directly from the 'exercise' prop.
 * Since the parent component conditionally renders this modal (remounts it on open),
 * we do NOT need a useEffect to synchronize state. The direct assignment in useState works perfectly.
 */
const ExerciseDetailModal = ({
  exercise,
  onClose,
  onSave,
  onDeleteExercise,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Direct initialization from props. No useEffect needed.
  const [sets, setSets] = useState(exercise?.sets || []);

  // UI state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!exercise) return null;

  // --- Handlers ---

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = Number(value);
    setSets(newSets);
  };

  const handleDeleteSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const handleAddSet = () => {
    // Duplicate the last set's data for better UX
    const lastSet =
      sets.length > 0 ? sets[sets.length - 1] : { weight: 0, reps: 0 };
    setSets([...sets, { ...lastSet, _id: undefined }]);
  };

  const handleSave = () => {
    if (sets.length === 0) {
      return toast.error("Exercise must have at least one set (or delete it).");
    }
    onSave({ ...exercise, sets: sets });
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    onDeleteExercise(exercise._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-base-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-base-200/50 p-4 border-b border-base-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {exercise.name}
              </h3>
              <p className="text-xs opacity-60">
                {isEditing ? "Editing Mode" : `${sets.length} total sets`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-ghost btn-square text-primary"
              >
                <Edit2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Table Headers */}
          <div
            className={`grid gap-2 mb-2 px-2 opacity-50 text-xs font-bold uppercase tracking-wider text-center ${
              isEditing ? "grid-cols-[0.5fr_1fr_1fr_0.5fr]" : "grid-cols-3"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Hash size={10} /> Set
            </div>
            <div className="flex items-center justify-center gap-1">
              <Dumbbell size={10} /> Kg
            </div>
            <div className="flex items-center justify-center gap-1">
              <Repeat size={10} /> Reps
            </div>
            {isEditing && <div></div>}
          </div>

          {/* Sets List */}
          <div className="space-y-2">
            {sets.map((set, index) => (
              <div
                key={index}
                className={`grid gap-2 bg-base-100 border border-base-200 p-2 rounded-xl text-center items-center transition-all ${
                  isEditing
                    ? "grid-cols-[0.5fr_1fr_1fr_0.5fr]"
                    : "grid-cols-3 hover:border-primary/30"
                }`}
              >
                <div className="font-bold text-sm text-primary">
                  {index + 1}
                </div>

                {isEditing ? (
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      handleSetChange(index, "weight", e.target.value)
                    }
                    className="input input-xs input-bordered w-full text-center"
                    placeholder="0"
                  />
                ) : (
                  <div className="font-mono text-sm">
                    {set.weight > 0 ? (
                      set.weight
                    ) : (
                      <span className="text-xs opacity-50">BW</span>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      handleSetChange(index, "reps", e.target.value)
                    }
                    className="input input-xs input-bordered w-full text-center"
                    placeholder="0"
                  />
                ) : (
                  <div className="font-mono text-sm font-bold">{set.reps}</div>
                )}

                {isEditing && (
                  <button
                    onClick={() => handleDeleteSet(index)}
                    className="btn btn-ghost btn-xs btn-square text-error mx-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <button
              onClick={handleAddSet}
              className="btn btn-outline btn-sm w-full mt-4 border-dashed border-base-content/20 gap-2"
            >
              <Plus size={16} /> Add Set
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-base-200 bg-base-50">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSave}
                className="btn btn-primary w-full gap-2"
              >
                <Save size={18} /> Save Changes
              </button>

              <div className="divider my-0"></div>

              {/* Delete Confirmation UI */}
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between animate-in slide-in-from-left-2 bg-error/10 p-2 rounded-lg border border-error/20">
                  <span className="text-xs text-error font-bold ml-2">
                    Delete Exercise?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn btn-ghost btn-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="btn btn-error btn-xs text-white"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-ghost text-error btn-sm w-full gap-2 opacity-70 hover:opacity-100"
                >
                  <Trash2 size={16} /> Delete Exercise
                </button>
              )}
            </div>
          ) : (
            <button onClick={onClose} className="btn btn-neutral btn-block">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailModal;

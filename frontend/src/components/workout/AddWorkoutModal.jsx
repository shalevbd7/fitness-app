import React, { useState } from "react";
import { useWorkoutStore } from "../../store/useWorkoutStore";
import {
  X,
  Plus,
  Trash2,
  Save,
  Dumbbell,
  Clock,
  Calendar,
  Hash,
  Repeat,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Modal for creating a new workout session.
 * * Architecture Note:
 * This component relies on Conditional Rendering from the parent.
 * It does not use useEffect to reset state. Instead, it relies on being
 * unmounted when closed and remounted when opened to ensure a clean state.
 */
const AddWorkoutModal = ({ onClose }) => {
  const { addWorkout, currentDate } = useWorkoutStore();

  // --- State Management ---

  // General workout metadata
  const [generalInfo, setGeneralInfo] = useState({
    name: "",
    date: currentDate,
    duration: 60,
  });

  /**
   * Exercises List State
   * Uses Lazy Initialization [() => ...] to safely invoke Date.now()
   * only once during the initial render, preventing impure render errors.
   */
  const [exercises, setExercises] = useState(() => [
    {
      id: Date.now(),
      name: "",
      sets: [{ weight: 0, reps: 0 }],
    },
  ]);

  // --- Handlers: General Info ---

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setGeneralInfo((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handlers: Exercise Logic ---

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        sets: [{ weight: 0, reps: 0 }],
      },
    ]);
  };

  const removeExercise = (exerciseId) => {
    if (exercises.length === 1) {
      return toast.error("Workout must have at least one exercise");
    }
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId, newName) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, name: newName } : ex))
    );
  };

  // --- Handlers: Set Logic ---

  const addSet = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        // Clone the last set's values for user convenience
        const lastSet = ex.sets[ex.sets.length - 1] || { weight: 0, reps: 0 };
        return {
          ...ex,
          sets: [...ex.sets, { weight: lastSet.weight, reps: lastSet.reps }],
        };
      })
    );
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        // Prevent removing the last set to maintain structure
        if (ex.sets.length === 1) return ex;
        return {
          ...ex,
          sets: ex.sets.filter((_, idx) => idx !== setIndex),
        };
      })
    );
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = [...ex.sets];
        newSets[setIndex][field] = Number(value);
        return { ...ex, sets: newSets };
      })
    );
  };

  // --- Submission Handler ---

  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!generalInfo.name.trim())
      return toast.error("Please name your workout");

    // 2. Filter empty exercises
    const validExercises = exercises.filter((ex) => ex.name.trim() !== "");
    if (validExercises.length === 0)
      return toast.error("Add at least one exercise with a name");

    // 3. Construct Payload
    const payload = {
      date: generalInfo.date,
      name: generalInfo.name,
      duration: Number(generalInfo.duration),
      exercises: validExercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({
          weight: Number(s.weight),
          reps: Number(s.reps),
        })),
      })),
    };

    // 4. Send to Store/API
    const success = await addWorkout(payload);
    if (success) {
      onClose();
    }
  };

  return (
    // Z-Index 100 ensures the modal appears above the bottom navigation bar
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Max height uses 'dvh' (dynamic viewport height) to better handle mobile browsers with address bars */}
      <div className="bg-base-100 w-full max-w-2xl max-h-[85dvh] sm:h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-100 z-10 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="text-primary" /> Log Workout
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        {/* Added pb-20 to ensure the last element is not hidden behind the save button/bottom edge */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
          {/* General Information Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-xl border border-base-200">
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">
                WORKOUT NAME
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Pull Day"
                className="input input-bordered w-full font-bold"
                value={generalInfo.name}
                onChange={handleInfoChange}
                autoFocus
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">DATE</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 size-4" />
                <input
                  type="date"
                  name="date"
                  className="input input-bordered w-full pl-9 text-sm"
                  value={generalInfo.date}
                  onChange={handleInfoChange}
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">
                DURATION (MIN)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 size-4" />
                <input
                  type="number"
                  name="duration"
                  className="input input-bordered w-full pl-9"
                  value={generalInfo.duration}
                  onChange={handleInfoChange}
                />
              </div>
            </div>
          </div>

          <div className="divider text-xs opacity-50 font-bold tracking-widest">
            EXERCISES
          </div>

          {/* Dynamic Exercises List */}
          <div className="space-y-6">
            {exercises.map((exercise, exIndex) => (
              <div
                key={exercise.id}
                className="card bg-base-100 border border-base-300 shadow-sm animate-in slide-in-from-bottom-2"
              >
                <div className="card-body p-4 bg-base-200/30 border-b border-base-200 flex-row items-center gap-3">
                  <div className="badge badge-neutral badge-lg h-8 w-8 p-0 flex items-center justify-center rounded-full">
                    {exIndex + 1}
                  </div>
                  <input
                    type="text"
                    placeholder="Exercise Name"
                    className="input input-ghost w-full font-bold text-lg h-auto p-1 focus:bg-base-100 placeholder:font-normal"
                    value={exercise.name}
                    onChange={(e) =>
                      updateExerciseName(exercise.id, e.target.value)
                    }
                  />
                  {exercises.length > 1 && (
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="btn btn-ghost btn-sm btn-square text-error opacity-50 hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="p-2">
                  <div className="grid grid-cols-[0.5fr_1fr_1fr_0.5fr] gap-2 mb-2 px-2 text-center">
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider flex justify-center items-center gap-1">
                      <Hash size={10} /> Set
                    </span>
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider flex justify-center items-center gap-1">
                      <Dumbbell size={10} /> kg
                    </span>
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider flex justify-center items-center gap-1">
                      <Repeat size={10} /> Reps
                    </span>
                    <span></span>
                  </div>

                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="grid grid-cols-[0.5fr_1fr_1fr_0.5fr] gap-2 items-center"
                      >
                        <div className="text-center font-bold text-sm text-primary bg-primary/5 rounded-lg py-2">
                          {setIndex + 1}
                        </div>
                        <input
                          type="number"
                          placeholder="0"
                          className="input input-sm input-bordered text-center w-full"
                          value={set.weight}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "weight",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          placeholder="0"
                          className="input input-sm input-bordered text-center w-full"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "reps",
                              e.target.value
                            )
                          }
                        />
                        <div className="flex justify-center">
                          {exercise.sets.length > 1 ? (
                            <button
                              onClick={() => removeSet(exercise.id, setIndex)}
                              className="btn btn-ghost btn-xs btn-square text-error"
                            >
                              <X size={14} />
                            </button>
                          ) : (
                            <div className="w-6"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSet(exercise.id)}
                    className="btn btn-ghost btn-xs w-full mt-3 border-dashed border border-base-300 opacity-60 hover:opacity-100 gap-2"
                  >
                    <Plus size={12} /> Add Set
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addExercise}
            className="btn btn-outline btn-block border-dashed h-12 gap-2 mt-4"
          >
            <Plus size={20} /> Add Another Exercise
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-base-200 bg-base-50 shrink-0">
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-full gap-2 text-lg shadow-lg shadow-primary/20"
          >
            <Save size={20} /> Save Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorkoutModal;

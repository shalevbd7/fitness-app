import React, { useEffect, useState } from "react";
import { useWorkoutStore } from "../../store/useWorkoutStore";
import { useUIStore } from "../../store/useUIStore";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Dumbbell,
  Timer,
  Info,
  Trash2,
} from "lucide-react";
import ExerciseDetailModal from "../../components/workout/ExerciseDetailModal";
import AddWorkoutModal from "../../components/workout/AddWorkoutModal";

/**
 * Main Workout Page Component.
 * Displays a list of workouts for a selected date, allows navigation between dates,
 * and provides access to workout creation and detailed exercise views.
 */
const WorkoutPage = () => {
  const {
    workouts,
    fetchWorkouts,
    isLoading,
    currentDate,
    setCurrentDate,
    updateWorkout,
    deleteWorkout,
  } = useWorkoutStore();
  const { setFabAction, resetFabAction } = useUIStore();

  const [selectedExerciseData, setSelectedExerciseData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Local state to manage the delete confirmation UI for a specific workout card
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Bind the global Floating Action Button (FAB) to open the 'Add Workout' modal
  useEffect(() => {
    setFabAction(() => setIsAddModalOpen(true));
    return () => resetFabAction();
  }, [setFabAction, resetFabAction]);

  // Fetch workouts whenever the date changes
  useEffect(() => {
    fetchWorkouts(currentDate);
  }, [fetchWorkouts, currentDate]);

  /**
   * Handles date navigation (previous/next day).
   * Resets any open delete confirmations.
   */
  const handleDateChange = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split("T")[0]);
    setDeleteConfirmId(null);
  };

  /**
   * Opens the detail modal for a specific exercise.
   */
  const handleExerciseClick = (workoutId, exercise) => {
    setSelectedExerciseData({ exercise, workoutId });
  };

  /**
   * Updates an exercise within a workout after editing in the modal.
   */
  const handleSaveExercise = async (updatedExercise) => {
    const { workoutId } = selectedExerciseData;
    const workoutToUpdate = workouts.find((w) => w._id === workoutId);
    if (!workoutToUpdate) return;

    const updatedExercises = workoutToUpdate.exercises.map((ex) =>
      ex._id === updatedExercise._id ? updatedExercise : ex
    );

    const success = await updateWorkout(workoutId, {
      exercises: updatedExercises,
    });

    if (success) {
      setSelectedExerciseData({ exercise: updatedExercise, workoutId });
      fetchWorkouts(currentDate); // Refresh data to ensure consistency
    }
  };

  /**
   * Deletes a specific exercise.
   * If the workout becomes empty (no exercises left), the entire workout is deleted automatically.
   */
  const handleDeleteExercise = async (exerciseId) => {
    const { workoutId } = selectedExerciseData;
    const workoutToUpdate = workouts.find((w) => w._id === workoutId);
    if (!workoutToUpdate) return;

    const updatedExercises = workoutToUpdate.exercises.filter(
      (ex) => ex._id !== exerciseId
    );

    if (updatedExercises.length === 0) {
      // Auto-delete workout if it has no exercises left
      const success = await deleteWorkout(workoutId);
      if (success) {
        setSelectedExerciseData(null);
        fetchWorkouts(currentDate);
      }
    } else {
      const success = await updateWorkout(workoutId, {
        exercises: updatedExercises,
      });
      if (success) {
        setSelectedExerciseData(null);
        fetchWorkouts(currentDate);
      }
    }
  };

  /**
   * Manually deletes an entire workout session via the card's delete button.
   */
  const handleManualDeleteWorkout = async (id) => {
    await deleteWorkout(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="pb-24 min-h-screen bg-base-100">
      {/* Date Navigation Header */}
      <div className="sticky top-16 z-20 bg-base-100/90 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => handleDateChange(-1)}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center text-primary">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Calendar size={18} />
              <span>
                {new Date(currentDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDateChange(1)}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto p-4 space-y-6 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Dumbbell className="mx-auto size-12 mb-4 opacity-20" />
            <p>No workouts recorded for this day.</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <div
              key={workout._id}
              className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden mt-20"
            >
              {/* Workout Card Header */}
              <div className="bg-base-200/50 p-4 border-b border-base-200 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <Dumbbell className="size-5 text-primary" /> {workout.name}
                  </h3>
                  <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                    <Timer size={12} /> {workout.duration} min •{" "}
                    {workout.exercises.length} exercises
                  </p>
                </div>

                {/* Delete Workout Action (Inline Confirmation) */}
                <div>
                  {deleteConfirmId === workout._id ? (
                    <div className="flex items-center gap-2 bg-base-100 p-1 rounded-lg border border-error/30 animate-in slide-in-from-right-4">
                      <span className="text-[10px] text-error font-bold px-1">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleManualDeleteWorkout(workout._id)}
                        className="btn btn-xs btn-error text-white"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="btn btn-xs btn-ghost"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(workout._id)}
                      className="btn btn-ghost btn-sm btn-square text-error opacity-50 hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Exercise List Items */}
              <div className="divide-y divide-base-200">
                {workout.exercises.map((exercise, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExerciseClick(workout._id, exercise)}
                    className="w-full flex items-center justify-between p-4 hover:bg-base-200/30 transition-colors group"
                  >
                    <div className="text-left">
                      <span className="font-bold text-sm block group-hover:text-primary transition-colors">
                        {exercise.name}
                      </span>
                      <span className="text-xs opacity-50">
                        {exercise.sets.length} sets
                      </span>
                    </div>
                    <Info
                      size={16}
                      className="opacity-0 group-hover:opacity-40 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExerciseData && (
        <ExerciseDetailModal
          exercise={selectedExerciseData.exercise}
          onClose={() => setSelectedExerciseData(null)}
          onSave={handleSaveExercise}
          onDeleteExercise={handleDeleteExercise}
        />
      )}

      {/* Add Workout Modal */}
      {isAddModalOpen && (
        <AddWorkoutModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkoutPage;

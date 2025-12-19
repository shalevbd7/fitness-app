import React, { useEffect, useState } from "react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useUIStore } from "../../store/useUIStore";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Coffee,
  Soup,
  Utensils,
  Cookie,
} from "lucide-react";
import MealModal from "../../components/diary/MealModal";
import AddMealModal from "../../components/diary/AddMealModal";

/**
 * Page component for viewing and managing daily food logs.
 */
const DiaryPage = () => {
  const { fetchDiary, currentLog, isLoading, currentDate, setCurrentDate } =
    useDiaryStore();
  const { setFabAction, resetFabAction } = useUIStore();

  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);

  // Synchronize Global Floating Action Button with local modal state
  useEffect(() => {
    setFabAction(() => setIsAddMealOpen(true));
    return () => resetFabAction();
  }, [setFabAction, resetFabAction]);

  useEffect(() => {
    fetchDiary(currentDate);
  }, [fetchDiary, currentDate]);

  const handleDateChange = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const isToday = currentDate === new Date().toISOString().split("T")[0];

  return (
    <div className="pb-24 min-h-screen bg-base-100">
      {/* Dynamic Date Header Bar */}
      <div className="sticky top-16 z-20 bg-base-100/90 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => handleDateChange(-1)}
            className="btn btn-sm btn-circle bg-base-200/60 hover:bg-base-300 border-none"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <Calendar size={18} />
              <span>
                {new Date(currentDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            {isToday && (
              <span className="mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="btn btn-sm btn-circle bg-base-200/60 hover:bg-base-300 border-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Main Meal Cards Container */}
      <div className="max-w-md mx-auto p-4 space-y-4 mt-20">
        {isLoading && !currentLog ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary size-6" />
          </div>
        ) : (
          <>
            <MealCard
              title="Breakfast"
              icon={<Coffee size={20} />}
              data={currentLog?.meals?.breakfast}
              onClick={() => setSelectedMealType("breakfast")}
            />
            <MealCard
              title="Lunch"
              icon={<Soup size={20} />}
              data={currentLog?.meals?.lunch}
              onClick={() => setSelectedMealType("lunch")}
            />
            <MealCard
              title="Dinner"
              icon={<Utensils size={20} />}
              data={currentLog?.meals?.dinner}
              onClick={() => setSelectedMealType("dinner")}
            />
            <MealCard
              title="Snacks"
              icon={<Cookie size={20} />}
              data={currentLog?.meals?.snack}
              onClick={() => setSelectedMealType("snack")}
            />
          </>
        )}
      </div>

      {/* Diary Modals */}
      {selectedMealType && (
        <MealModal
          isOpen={!!selectedMealType}
          onClose={() => setSelectedMealType(null)}
          mealType={selectedMealType}
          mealData={currentLog?.meals?.[selectedMealType]}
          date={currentDate}
        />
      )}

      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
      />
    </div>
  );
};

/**
 * MealCard sub-component for displaying calorie summaries per category.
 */
const MealCard = ({ title, icon, data, onClick }) => {
  const totalCals =
    data?.items?.reduce(
      (sum, item) => sum + item.calculatedValues.calories,
      0
    ) || 0;

  const itemCount = data?.items?.length || 0;

  return (
    <div
      onClick={onClick}
      className="card bg-base-100 border border-base-200 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
    >
      <div className="card-body p-4 flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-xs opacity-60">
              {itemCount
                ? `${itemCount} ${itemCount === 1 ? "Item" : "Items"}`
                : "No items yet"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono font-bold text-2xl text-primary">
            {Math.round(totalCals)}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-60">
            kcal
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;

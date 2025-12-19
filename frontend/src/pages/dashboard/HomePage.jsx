import { useEffect, useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Dumbbell, Utensils, Zap, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";
import AddMealModal from "../../components/diary/AddMealModal";

/**
 * Reusable Stat Card component for the dashboard overview.
 */
const StatCard = ({ title, value, icon: Icon, colorClass, footer }) => (
  <div className="card w-full shadow-xl bg-base-100 border border-base-300">
    <div className="card-body p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="card-title text-sm font-semibold opacity-70">{title}</h2>
        <Icon className={`size-5 ${colorClass}`} />
      </div>
      <p className="text-3xl font-extrabold mt-1">{value}</p>
      {footer && <div className="text-xs mt-2 opacity-80">{footer}</div>}
    </div>
  </div>
);

const HomePage = () => {
  const { dashboardData, fetchDashboardData, isLoading } = useDashboardStore();
  const { authUser } = useAuthStore();
  const { setFabAction, resetFabAction } = useUIStore();
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);

  const firstName = authUser?.fullName?.split(" ")[0] || "User";

  // Connect FAB button to AddMealModal
  useEffect(() => {
    setFabAction(() => setIsAddMealOpen(true));
    return () => resetFabAction();
  }, [setFabAction, resetFabAction]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading || !dashboardData) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-primary size-10" />
      </div>
    );
  }

  // Extract relevant metrics from the server response
  const { headerData, dailySummary, workoutSummary, weightData } =
    dashboardData;

  // Calorie calculations
  const caloriesConsumed = headerData.caloriesConsumed || 0;
  const caloriesTarget = headerData.calorieTarget || 2500;
  const caloriesLeft = caloriesTarget - caloriesConsumed;

  /**
   * Identifies the most recently logged food item across all meals.
   */
  const findLastMeal = () => {
    const meals = dailySummary.logDetails;
    const allItems = [
      ...(meals.breakfast?.items || []),
      ...(meals.lunch?.items || []),
      ...(meals.dinner?.items || []),
      ...(meals.snack?.items || []),
    ];

    return allItems.length > 0 ? allItems[allItems.length - 1] : null;
  };

  const lastMealItem = findLastMeal();

  // Count active meal categories for the current day
  let mealsEatenCount = 0;
  if (dailySummary.logDetails.breakfast?.items.length > 0) mealsEatenCount++;
  if (dailySummary.logDetails.lunch?.items.length > 0) mealsEatenCount++;
  if (dailySummary.logDetails.dinner?.items.length > 0) mealsEatenCount++;

  /**
   * Renders the weight change footer with appropriate success/error colors.
   */
  const renderWeightFooter = () => {
    if (!weightData || !weightData.current) {
      return <span className="text-xs opacity-50">No data recorded</span>;
    }

    if (weightData.change === 0) {
      return <span className="text-xs opacity-50">No change vs last week</span>;
    }

    const isLoss = weightData.change < 0;
    const color = isLoss ? "text-success" : "text-error";
    const arrow = isLoss ? "↓" : "↑";

    return (
      <span className={`text-xs font-bold ${color}`}>
        {arrow} {Math.abs(weightData.change)} kg{" "}
        <span className="opacity-60 font-normal text-base-content">
          vs last week
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-24 p-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold">Hello, {firstName} 👋</h1>
        <p className="text-xs opacity-60">Here is your daily overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Metric Cards Grid */}
        <StatCard
          title="Current Weight"
          value={weightData?.current > 0 ? `${weightData.current} kg` : "--"}
          icon={Dumbbell}
          colorClass="text-info"
          footer={renderWeightFooter()}
        />

        <StatCard
          title="Calories Left"
          value={caloriesLeft > 0 ? caloriesLeft : 0}
          icon={Zap}
          colorClass="text-warning"
          footer={
            <span>
              {caloriesConsumed} / {caloriesTarget} kcal
            </span>
          }
        />

        <StatCard
          title="Meals Logged"
          value={`${mealsEatenCount} / 3`}
          icon={Utensils}
          colorClass="text-success"
          footer={<span>Keep eating healthy!</span>}
        />

        <StatCard
          title="Workouts"
          value={`${workoutSummary.workoutsCompleted} / ${workoutSummary.target}`}
          icon={Dumbbell}
          colorClass="text-secondary"
          footer={<span>Next: {workoutSummary.nextWorkout}</span>}
        />
      </div>

      {/* Recency Area */}
      <h1 className="text-xl font-bold mt-8 mb-4">Last Item Logged</h1>
      {lastMealItem ? (
        <div className="card shadow-xl bg-base-100 border border-base-300">
          <div className="card-body p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{lastMealItem.name}</h3>
                <p className="text-xs opacity-70 mt-1">
                  {Math.round(lastMealItem.amountConsumed)}{" "}
                  {lastMealItem.unit === "unit" ? "units" : "g"}
                </p>
              </div>
              <div className="badge badge-primary badge-outline">
                {Math.round(lastMealItem.calculatedValues?.calories || 0)} kcal
              </div>
            </div>

            <div className="divider my-1"></div>

            <div className="flex justify-between text-sm font-semibold opacity-80">
              <span className="text-primary">
                P: {lastMealItem.calculatedValues?.protein}g
              </span>
              <span className="text-secondary">
                C: {lastMealItem.calculatedValues?.carbs}g
              </span>
              <span className="text-accent">
                F: {lastMealItem.calculatedValues?.fat}g
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert bg-base-100 border border-base-300">
          <Utensils className="size-4 opacity-50" />
          <span className="opacity-70">No food logged yet today.</span>
        </div>
      )}

      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
      />
    </div>
  );
};

export default HomePage;

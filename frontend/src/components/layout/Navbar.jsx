import { User, Plus, Dumbbell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useUIStore } from "../../store/useUIStore";

/**
 * Global Navbar containing dynamic nutritional tracking and user controls.
 */
const Navbar = () => {
  const { authUser } = useAuthStore();

  // Subscribes to diary state for real-time macro updates
  const { currentLog, dailyGoals } = useDiaryStore();
  const { fabAction } = useUIStore();

  // Safely extract intake data with fallback values
  const dailyIntake = currentLog?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  const caloriesGoal = dailyGoals?.calories || 2500;

  /**
   * Calculates the percentage of the current intake against the daily goal.
   */
  const calculatePercentage = (intake, goal) => {
    if (goal === 0) return 0;
    return Math.min(100, Math.round((intake / goal) * 100));
  };

  const caloriesPercent = calculatePercentage(
    dailyIntake.calories,
    caloriesGoal
  );

  /**
   * Triggers the UI-specific action defined in the current context (usually opening Add Meal modal).
   */
  const handleFabClick = () => {
    if (fabAction) {
      fabAction();
    } else {
      console.warn("No FAB action defined for current context.");
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-300 fixed top-0 z-50 h-16">
      {/* Action Area: Reporting meals */}
      <div className="navbar-start">
        <button
          className="btn btn-ghost btn-circle text-primary"
          onClick={handleFabClick}
        >
          <Plus className="size-6" />
        </button>
      </div>

      {/* Center Branding/Logo */}
      <div className="navbar-center">
        <Link to="/" className="btn btn-ghost text-xl normal-case gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Dumbbell className="size-5" />
          </div>
        </Link>
      </div>

      {/* Nutritional Summary and User Profile */}
      <div className="navbar-end gap-2">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm h-auto py-1 px-2 flex-col items-end gap-0"
          >
            <span className="text-xs font-bold">
              {dailyIntake.calories} / {caloriesGoal}
            </span>
            <span className="text-[10px] text-base-content/60 flex items-center gap-1">
              kcal ({caloriesPercent}%) <ChevronDown className="size-3" />
            </span>
          </div>

          {/* Macro Breakdown Dropdown */}
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 mt-4 border border-base-200"
          >
            <li>
              <div className="flex justify-between py-2">
                <span className="text-xs">Protein</span>
                <span className="text-xs font-bold text-primary">
                  {dailyIntake.protein}g
                </span>
              </div>
            </li>
            <li>
              <div className="flex justify-between py-2">
                <span className="text-xs">Carbs</span>
                <span className="text-xs font-bold text-secondary">
                  {dailyIntake.carbs}g
                </span>
              </div>
            </li>
            <li>
              <div className="flex justify-between py-2">
                <span className="text-xs">Fat</span>
                <span className="text-xs font-bold text-accent">
                  {dailyIntake.fat}g
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* User Account Access */}
        <Link
          to="/profile"
          className="btn btn-ghost btn-circle avatar placeholder border border-base-300"
        >
          <div className="bg-neutral text-neutral-content rounded-full w-8">
            <span className="text-xs">
              {authUser?.fullName?.charAt(0).toUpperCase() || <User />}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

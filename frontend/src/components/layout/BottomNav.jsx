import React from "react";
import { Home, Utensils, Package, Dumbbell } from "lucide-react";
import { NavLink } from "react-router-dom";

/**
 * Bottom navigation bar for mobile-first user experience.
 */
const BottomNav = () => {
  return (
    <div className="btm-nav btm-nav-lg border-t border-base-300 bg-base-100 z-50">
      {/* Navigation to Dashboard/Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "active text-primary bg-primary/10"
            : "text-base-content/60"
        }
      >
        <Home className="size-6" />
        <span className="btm-nav-label text-xs"> Home</span>
      </NavLink>

      {/* Navigation to Daily Log/Meals */}
      <NavLink
        to="/meals"
        className={({ isActive }) =>
          isActive
            ? "active text-primary bg-primary/10"
            : "text-base-content/60"
        }
      >
        <Utensils className="size-6" />
        <span className="btm-nav-label text-xs">Meals</span>
      </NavLink>

      {/* Navigation to Product Catalog */}
      <NavLink
        to="/products"
        className={({ isActive }) =>
          isActive
            ? "active text-primary bg-primary/10"
            : "text-base-content/60"
        }
      >
        <Package className="size-6" />
        <span className="btm-nav-label text-xs">Products</span>
      </NavLink>

      {/* Navigation to Workouts - Now Active! */}
      <NavLink
        to="/workouts"
        className={({ isActive }) =>
          isActive
            ? "active text-primary bg-primary/10"
            : "text-base-content/60"
        }
      >
        <Dumbbell className="size-6" />
        <span className="btm-nav-label text-xs">Workout</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;

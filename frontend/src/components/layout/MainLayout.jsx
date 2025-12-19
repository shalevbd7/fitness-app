import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { useDiaryStore } from "../../store/useDiaryStore";

/**
 * Main application layout wrapper.
 * Handles initial global data fetching and common UI structures.
 */
const MainLayout = () => {
  const fetchDiary = useDiaryStore((state) => state.fetchDiary);

  // Fetch the latest diary entry from the server on initial mount
  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Global Top Navigation */}
      <Navbar />

      {/* Main view container with padding for Fixed bars */}
      <main className="pt-16 pb-24 px-4 min-h-screen overflow-y-auto">
        <Outlet />
      </main>

      {/* Global Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;

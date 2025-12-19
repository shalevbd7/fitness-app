import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Pages & Layout components
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/dashboard/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProductsPage from "./pages/products/ProductPage";
import DiaryPage from "./pages/diary/DiaryPage";
import WorkoutPage from "./pages/workout/WorkoutPage";

/**
 * Root Application component.
 * Responsible for:
 * 1. Initial Authentication Check.
 * 2. Routing configuration (Public vs Protected routes).
 * 3. Global Theme Management and synchronization.
 */
const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // 1. Verify user session on initial app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Inject the selected theme into the HTML root for DaisyUI/Tailwind
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 3. Synchronize theme from user profile (server) if no local preference exists
  useEffect(() => {
    const serverTheme = authUser?.profile?.theme;
    const localTheme = localStorage.getItem("theme");

    if (!localTheme && serverTheme) {
      setTheme(serverTheme);
    }
  }, [authUser?.profile?.theme, setTheme]);

  // Show loading spinner while authentication status is being verified
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Routes>
        {/* Protected Routes: Accessible only to authenticated users */}
        <Route element={authUser ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/meals" element={<DiaryPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/workouts" element={<WorkoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Public Routes: Login and Registration */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!authUser ? <RegisterPage /> : <Navigate to="/" />}
        />

        {/* Fallback Route: Redirects any unknown path to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Notification Toaster */}
      <Toaster position="top-center" />
    </div>
  );
};

export default App;

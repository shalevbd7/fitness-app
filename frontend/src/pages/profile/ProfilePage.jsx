import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { THEMES } from "../../constans/themes";
import {
  User,
  Activity,
  Save,
  Loader2,
  LogOut,
  Palette,
  ChevronDown,
} from "lucide-react";

/**
 * User Profile page for managing physical statistics, daily targets, and UI preferences.
 */
const ProfilePage = () => {
  const {
    authUser,
    updateProfile,
    isUpdatingProfile,
    fetchUserProfile,
    isFetchingProfile,
    logout,
  } = useAuthStore();

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const dataKey =
    authUser?.updatedAt || JSON.stringify(authUser?.profile || {});

  if (!authUser && isFetchingProfile) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (!authUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 pb-24">
      {/* User Information Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-16">
              <span className="text-3xl">
                {authUser.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{authUser.fullName}</h1>
            <p className="opacity-60">{authUser.email}</p>
          </div>
        </div>

        <button onClick={logout} className="btn btn-ghost text-error">
          <LogOut className="size-5" />
        </button>
      </div>

      {/* Theme Customization Section */}
      <ThemeSelector updateProfile={updateProfile} />

      {/* Core Profile Statistics Form */}
      <ProfileForm
        key={dataKey}
        authUser={authUser}
        updateProfile={updateProfile}
        isUpdatingProfile={isUpdatingProfile}
      />
    </div>
  );
};

/**
 * Component for selecting and synchronizing application themes.
 */
const ThemeSelector = ({ updateProfile }) => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme); // Fast local update
    try {
      await updateProfile({ theme: newTheme }); // Persist to server
    } catch (err) {
      console.error("Failed to save theme", err);
    }
    // Remove focus from dropdown after selection
    const elem = document.activeElement;
    if (elem) elem?.blur();
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 overflow-visible">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2 mb-2">
          <Palette className="size-5 text-accent" />
          App Theme
        </h2>

        <div className="dropdown w-full">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline w-full justify-between"
          >
            <span className="capitalize">{theme}</span>
            <ChevronDown className="size-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[50] menu p-2 shadow-2xl bg-base-100 rounded-box w-full max-h-60 overflow-y-auto flex-nowrap border border-base-300"
          >
            {THEMES.map((t) => (
              <li key={t}>
                <button
                  onClick={() => handleThemeChange(t)}
                  className={`flex justify-between items-center ${
                    theme === t ? "active" : ""
                  }`}
                >
                  <span className="capitalize">{t}</span>
                  <div className="flex gap-1" data-theme={t}>
                    <div className="bg-primary w-2 h-4 rounded"></div>
                    <div className="bg-secondary w-2 h-4 rounded"></div>
                    <div className="bg-accent w-2 h-4 rounded"></div>
                    <div className="bg-neutral w-2 h-4 rounded"></div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Detailed form for updating user metrics and nutritional goals.
 */
const ProfileForm = ({ authUser, updateProfile, isUpdatingProfile }) => {
  const [formData, setFormData] = useState({
    weight: authUser.profile?.weight || 0,
    height: authUser.profile?.height || 0,
    age: authUser.profile?.age || 0,
    dailyCalorieTarget: authUser.profile?.dailyCalorieTarget || 2000,
    dailyProteinTarget: authUser.profile?.dailyProteinTarget || 150,
    dailyCarbTarget: authUser.profile?.dailyCarbTarget || 300,
    dailyFatTarget: authUser.profile?.dailyFatTarget || 70,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ profile: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Physical Stats Section */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2 mb-4">
            <User className="size-5 text-primary" />
            Physical Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              label="Weight (kg)"
              name="weight"
              val={formData.weight}
              onChange={handleChange}
              step="0.1"
            />
            <InputGroup
              label="Height (cm)"
              name="height"
              val={formData.height}
              onChange={handleChange}
            />
            <InputGroup
              label="Age"
              name="age"
              val={formData.age}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Target Macros Section */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2 mb-4">
            <Activity className="size-5 text-secondary" />
            Daily Targets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Calories"
              name="dailyCalorieTarget"
              val={formData.dailyCalorieTarget}
              onChange={handleChange}
              fullWidth
            />
            <InputGroup
              label="Protein (g)"
              name="dailyProteinTarget"
              val={formData.dailyProteinTarget}
              onChange={handleChange}
            />
            <InputGroup
              label="Carbs (g)"
              name="dailyCarbTarget"
              val={formData.dailyCarbTarget}
              onChange={handleChange}
            />
            <InputGroup
              label="Fat (g)"
              name="dailyFatTarget"
              val={formData.dailyFatTarget}
              onChange={handleChange}
              fullWidth
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary gap-2"
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
};

const InputGroup = ({ label, name, val, onChange, step, fullWidth }) => (
  <div className={`form-control ${fullWidth ? "md:col-span-2" : ""}`}>
    <label className="label">
      <span className="label-text font-medium">{label}</span>
    </label>
    <input
      type="number"
      name={name}
      value={val}
      onChange={onChange}
      step={step}
      className="input input-bordered"
    />
  </div>
);

export default ProfilePage;

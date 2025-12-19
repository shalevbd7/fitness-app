import {
  signupService,
  loginService,
  generateTokenAndCookies,
  checkAuthService,
} from "../service/auth.service.js";

/**
 * Controller for user registration.
 */
export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await signupService(email, fullName, password);
    generateTokenAndCookies(user._id, res);

    res.status(201).json(user);
  } catch (error) {
    const status = error.message.includes("exist") ? 400 : 500;
    console.log("Error in signup controller:", error.message);
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * Controller for user login.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await loginService(email, password);
    generateTokenAndCookies(user._id, res);

    res.status(200).json(user);
  } catch (error) {
    const status = error.message.includes("Invalid credentials") ? 400 : 500;
    console.log("Error in login controller:", error.message);
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * Clears the JWT cookie to log out the user.
 */
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Returns the authenticated user data.
 */
export const checkAuth = (req, res) => {
  try {
    const user = checkAuthService(req.user);
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

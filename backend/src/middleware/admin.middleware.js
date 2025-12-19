/**
 * Middleware to restrict access to administrators only.
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: You do not have administrator permissions.",
    });
  }

  next();
};

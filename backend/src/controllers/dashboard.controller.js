import { getDashboardData } from "../service/dashboard.service.js";

/**
 * Controller to fetch aggregated dashboard data for the user.
 * Provides a summary of calories, protein, and activity for a specific date.
 */
export const getDashboardController = async (req, res) => {
  try {
    const userId = req.user._id;
    // Defaults to the current date if no date is provided in the query parameters
    const date = req.query.date || new Date();

    const dashboardData = await getDashboardData(userId, date);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch dashboard data: " + error.message,
    });
  }
};

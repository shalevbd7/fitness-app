import axios from "axios";

export const axiosInstance = axios.create({
  // התנאי עובד כך:
  // אם מוגדרת כתובת VITE_API_URL (שנגדיר ב-Render), תשתמש בה.
  // אחרת (למשל כשאתה עובד מקומית במחשב), תשתמש ב-localhost:3000.
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://localhost:3000/api",

  withCredentials: true,
});


import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const expertClient = axios.create({
  baseURL: `${API_URL}/experts`,
  timeout: 30000,
});

expertClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Get logged-in Agri Expert profile
export const getExpertProfile = async () => {
  const response = await expertClient.get("/profile");
  return response.data;
};

// Get active Agri Experts directory
export const getExpertsDirectory = async () => {
  const response = await expertClient.get("/");
  return response.data;
};

export default expertClient;

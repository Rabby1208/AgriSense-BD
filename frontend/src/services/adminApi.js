import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const adminClient = axios.create({
  baseURL: `${API_URL}/admin`,
  timeout: 30000,
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAdminProfile = async () => {
  const response = await adminClient.get("/profile");
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await adminClient.get("/dashboard");
  return response.data;
};

export const getAdminExperts = async () => {
  const response = await adminClient.get("/experts");
  return response.data;
};

export const createAgriExpert = async (expertData) => {
  const response = await adminClient.post("/experts", expertData);
  return response.data;
};

export const getAdminDiseaseDetectionStats = async () => {
  const response = await adminClient.get("/disease-detection/stats");
  return response.data;
};

export const getAdminDiseaseDetectionHistory = async (params = {}) => {
  const response = await adminClient.get("/disease-detection/history", {
    params,
  });
  return response.data;
};

export default adminClient;


import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const farmerClient = axios.create({
  baseURL: `${API_URL}/farmer`,
  timeout: 30000,
});

farmerClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agrisense_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getFarmerDashboard = async () => {
  const response = await farmerClient.get("/dashboard");
  return response.data;
};

export const getFarmerProfile = async () => {
  const response = await farmerClient.get("/profile");
  return response.data;
};

export const updateFarmerProfile = async (profileData) => {
  const response = await farmerClient.put("/profile", profileData);
  return response.data;
};

export const getAvailableCrops = async () => {
  const response = await farmerClient.get("/crops");
  return response.data;
};

export const getMyCrops = async () => {
  const response = await farmerClient.get("/my-crops");
  return response.data;
};

export const addFarmerCrop = async (cropData) => {
  const response = await farmerClient.post("/crops", cropData);
  return response.data;
};

export const updateFarmerCrop = async (cropId, cropData) => {
  const response = await farmerClient.put(
    `/crops/${cropId}`,
    cropData
  );
  return response.data;
};

export const deleteFarmerCrop = async (cropId) => {
  const response = await farmerClient.delete(`/crops/${cropId}`);
  return response.data;
};

export default farmerClient;

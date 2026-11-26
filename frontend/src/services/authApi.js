
import axios from "axios";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

const authClient = axios.create({
  baseURL: `${API_URL}/auth`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerFarmer = async (userData) => {
  const response = await authClient.post("/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await authClient.post("/login", credentials);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await authClient.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export default authClient;

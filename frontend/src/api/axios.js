import axios from "axios";

const api = axios.create({
  baseURL: "https://team-task-manager-production-a40e.up.railway.app",
  withCredentials: true
});

// Send token automatically with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
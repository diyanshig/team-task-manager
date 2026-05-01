import axios from "axios";

const api = axios.create({
  baseURL: "https://team-task-manager-production-cc91.up.railway.app",
  withCredentials: true
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("API REQUEST:", config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


api.interceptors.response.use(
  (response) => {
    console.log(" API RESPONSE:", response.config.url, response.data);

    
    if (
      typeof response.data === "string" &&
      response.data.includes("<!doctype html>")
    ) {
      console.error(
        " ERROR: API returned HTML instead of JSON. Wrong backend route or deployment issue."
      );
    }

    return response;
  },
  (error) => {
    console.error(" API ERROR:", {
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });

    return Promise.reject(error);
  }
);

export default api;
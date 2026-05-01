import axios from "axios";

const api = axios.create({
  baseURL: "https://team-task-manager-production-a40e.up.railway.app" // 👈 replace this
});

export default api;
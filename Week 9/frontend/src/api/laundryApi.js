import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

export const fetchDashboard = async (params) => {
  const response = await api.get("/laundry/dashboard", { params });
  return response.data?.data;
};

export default api;

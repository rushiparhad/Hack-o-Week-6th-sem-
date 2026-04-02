import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

export const fetchDashboard = async (params) => {
  const { data } = await api.get("/dashboard", { params });
  return data.data;
};

export const fetchPredictions = async (params) => {
  const { data } = await api.get("/predictions", { params });
  return data.data;
};

export const fetchDrilldown = async (params) => {
  const { data } = await api.get("/drilldown", { params });
  return data.data;
};

export const fetchFilters = async (params) => {
  const { data } = await api.get("/filters", { params });
  return data.data;
};

export const getExportUrl = (params) => {
  const search = new URLSearchParams(params);
  return `/api/export/csv?${search.toString()}`;
};

export default api;
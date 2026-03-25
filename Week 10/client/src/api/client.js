import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 20000,
});

export function getDashboard(params) {
  return api.get("/dashboard", { params });
}

export function getPredictions(params) {
  return api.get("/predictions", { params });
}

export function getDrilldown(params) {
  return api.get("/drilldown", { params });
}

export function getFilters(params) {
  return api.get("/filters", { params });
}

export function exportCsv(params) {
  return api.get("/export/csv", { params, responseType: "blob" });
}

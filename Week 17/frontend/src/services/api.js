import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload)
};

export const metricsApi = {
  getMetrics: (params) => api.get('/metrics', { params }),
  simulateMetric: () => api.post('/metrics/simulate'),
  ingestMetric: (payload) => api.post('/metrics', payload)
};

export const exportApi = {
  download: (format, params, onDownloadProgress) =>
    api.get(`/export/${format}`, {
      params,
      responseType: 'blob',
      onDownloadProgress
    })
};

export const logsApi = {
  getLogs: (params) => api.get('/logs', { params })
};

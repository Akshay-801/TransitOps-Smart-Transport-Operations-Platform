import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to extract data cleanly
apiClient.interceptors.response.use(
  (response) => {
    // If the backend wraps the data in standard response { success, message, data }
    if (response.data && response.data.hasOwnProperty('success')) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Pass along error details
    if (error.response && error.response.data && error.response.data.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Vehicles
  vehicles: {
    getAll: (status) => apiClient.get('/vehicles', { params: { status } }),
    getOne: (id) => apiClient.get(`/vehicles/${id}`),
    create: (data) => apiClient.post('/vehicles', data),
    update: (id, data) => apiClient.put(`/vehicles/${id}`, data),
    delete: (id) => apiClient.delete(`/vehicles/${id}`),
  },

  // Drivers
  drivers: {
    getAll: (status) => apiClient.get('/drivers', { params: { status } }),
    getOne: (id) => apiClient.get(`/drivers/${id}`),
    create: (data) => apiClient.post('/drivers', data),
    update: (id, data) => apiClient.put(`/drivers/${id}`, data),
    delete: (id) => apiClient.delete(`/drivers/${id}`),
  },

  // Trips
  trips: {
    getAll: (status) => apiClient.get('/trips', { params: { status } }),
    getOne: (id) => apiClient.get(`/trips/${id}`),
    create: (data) => apiClient.post('/trips', data),
    dispatch: (id) => apiClient.post(`/trips/${id}/dispatch`),
    complete: (id, actualDistance) => apiClient.post(`/trips/${id}/complete`, { tripId: id, actualDistance }),
    cancel: (id) => apiClient.post(`/trips/${id}/cancel`),
  },

  // Maintenance
  maintenance: {
    getAll: (openOnly) => apiClient.get('/maintenance', { params: { openOnly } }),
    getOne: (id) => apiClient.get(`/maintenance/${id}`),
    open: (data) => apiClient.post('/maintenance', data),
    close: (id, cost) => apiClient.post(`/maintenance/${id}/close`, { maintenanceId: id, cost }),
  },

  // Fuel
  fuel: {
    getAll: (vehicleId) => apiClient.get('/fuel', { params: { vehicleId } }),
    log: (data) => apiClient.post('/fuel', data),
    delete: (id) => apiClient.delete(`/fuel/${id}`),
  },

  // Expenses
  expenses: {
    getAll: (vehicleId) => apiClient.get('/expenses', { params: { vehicleId } }),
    create: (data) => apiClient.post('/expenses', data),
    delete: (id) => apiClient.delete(`/expenses/${id}`),
  },

  // Analytics
  analytics: {
    summary: () => apiClient.get('/analytics/summary'),
    vehicleRoi: () => apiClient.get('/analytics/vehicle-roi'),
    fuelEfficiency: () => apiClient.get('/analytics/fuel-efficiency'),
    operationalCost: () => apiClient.get('/analytics/operational-cost'),
    exportCsv: () => apiClient.get('/analytics/export/csv', { responseType: 'blob' }),
  }
};

export default apiService;

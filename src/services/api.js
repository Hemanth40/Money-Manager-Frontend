import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://money-manager-backend-d9pc.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Transaction APIs
export const transactionAPI = {
    getAll: (params = {}) => api.get('/transactions', { params }),
    getOne: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
    getSummary: (params = {}) => api.get('/transactions/summary', { params }),
    getReport: (period = 'month') => api.get('/transactions/report', { params: { period } }),
};

// Account APIs
export const accountAPI = {
    getAll: () => api.get('/accounts'),
    getOne: (id) => api.get(`/accounts/${id}`),
    create: (data) => api.post('/accounts', data),
    update: (id, data) => api.put(`/accounts/${id}`, data),
    delete: (id) => api.delete(`/accounts/${id}`),
    transfer: (data) => api.post('/accounts/transfer', data),
    getTransfers: (params = {}) => api.get('/accounts/transfers', { params }),
    getTotalBalance: () => api.get('/accounts/total-balance'),
};

// Category APIs
export const categoryAPI = {
    getAll: (type = null) => api.get('/categories', { params: type ? { type } : {} }),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    seed: () => api.post('/categories/seed'),
};

export default api;

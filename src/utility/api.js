import axios from 'axios';

const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: url
});

// Add a request interceptor to add the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers.token = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle specialized errors (like 401/403)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // You can add global error handling here if desired
        // e.g. auto-logout for 401s if you don't want to do it per component
        return Promise.reject(error);
    }
);

export default api;

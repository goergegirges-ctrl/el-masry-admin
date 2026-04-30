import axios from 'axios';

const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: url,
    withCredentials: true
});

// Add a request interceptor to add the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh the token
                const res = await axios.get(`${url}/api/users/refresh`, { withCredentials: true });
                if (res.data.success) {
                    const newToken = res.data.token;
                    localStorage.setItem('admin_token', newToken);
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout
                console.error("Token refresh failed:", refreshError);
            }

            // Cleanup and logout if refresh fails
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

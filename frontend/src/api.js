import axios from 'axios';
import session from './session';

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/users/"
});

// 🚀 Interceptor 1: Automatically attach the token
API.interceptors.request.use((config) => {
    // FIX: Match the key used during login ('access' vs 'access_token')
    const token = session.get('access');
    // Debug: log token presence for troubleshooting 401s
    if (token) {
        // attach token
        config.headers.Authorization = `Bearer ${token}`;
        console.log("TOKEN SENT:", token);
    } else {
        console.log("NO TOKEN FOUND");
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 🚀 Interceptor 2: Refresh token
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = session.get('refresh'); // Ensure this key matches your login
                const res = await axios.post('http://127.0.0.1:8000/api/users/token/refresh/', {
                    refresh: refreshToken
                });

                if (res.status === 200) {
                    session.set('access', res.data.access); // Update the 'access' key
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return API(originalRequest);
                }
            } catch (refreshError) {
                session.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
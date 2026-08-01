import axios from "axios";
import { getAuth, signOut } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6300/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token (Firebase handles this automatically)
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Get new token
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Sign out user if token refresh fails
        await signOut(getAuth());
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with a status code outside 2xx
      const errorMessage = error.response.data?.message || "Request failed";
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error("Network error. Please check your connection."));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error("Request setup error"));
    }
  }
);

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || "Request failed";

    if (status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      window.location.href = "/login";
      return "Session expired. Please login again.";
    } else if (status === 403) {
      // Forbidden
      return "Access denied. You don't have permission to perform this action.";
    } else if (status === 404) {
      // Not found
      return "Resource not found.";
    } else if (status >= 500) {
      // Server error
      return "Server error. Please try again later.";
    } else {
      return message;
    }
  } else if (error.request) {
    // Network error
    return "Network error. Please check your connection.";
  } else {
    // Request setup error
    return error.message || "An unknown error occurred.";
  }
};

export default apiClient;

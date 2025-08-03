import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (window === undefined) return config;
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (window === undefined) ;
    //   if (error.response?.status === 401) {
    //     localStorage.removeItem("auth_token");
    //     window.location.href = "/auth/login";
    //   }
    if (isAxiosError(error)) {
      if (error.response?.data.detail) {
        toast(error.response?.data.detail);
      }
    }
    return Promise.reject(error);

    // return Promise.reject(error);
  }
);

export default apiClient;

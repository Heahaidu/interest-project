import axios from "axios"
import { getCookie } from "cookies-next";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create(
    {
        baseURL: API_BASE_URL,
    }
);

export const apiClientAuth = () => {
    const token = getCookie("token");
  
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };
  

apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {

        return Promise.reject(error);
    },
);
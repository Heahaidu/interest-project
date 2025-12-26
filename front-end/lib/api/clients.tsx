import axios from "axios"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create(
    {
        baseURL: API_BASE_URL,
    }
);

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
import axios from "axios"

export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api/v1";

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
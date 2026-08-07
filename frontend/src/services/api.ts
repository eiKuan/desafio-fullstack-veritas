import axios, { type AxiosError } from "axios";
import type { ErrorResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Erro inesperado na comunicação com a API.";
    return Promise.reject(new Error(message));
  },
);

export default api;

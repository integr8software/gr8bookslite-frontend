import axios from "axios";
import { GetApiBaseUrl } from "@/app/src/services/shared/ApiUrl";

export const ApiClient = axios.create({
  baseURL: GetApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

ApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return Promise.reject(new Error(message.join(" ")));
    }

    if (typeof message === "string") {
      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error(error.message || "Request failed."));
  },
);

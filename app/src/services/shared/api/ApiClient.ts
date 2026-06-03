import axios from "axios";
import {
  FinishApiRequestTrace,
  StartApiRequestTrace,
} from "@/app/src/services/shared/api/ApiRequestTrace";
import { GetApiBaseUrl } from "@/app/src/services/shared/api/ApiUrl";

export const ApiClient = axios.create({
  baseURL: GetApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

ApiClient.interceptors.request.use((config) => {
  StartApiRequestTrace(config);

  return config;
});

ApiClient.interceptors.response.use(
  (response) => {
    FinishApiRequestTrace(response.config, response.status);

    return response;
  },
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    FinishApiRequestTrace(error.config, error.response?.status);
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

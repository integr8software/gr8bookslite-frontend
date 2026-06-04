import axios, { AxiosHeaders } from "axios";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import {
  FinishApiRequestTrace,
  StartApiRequestTrace,
} from "@/app/src/services/shared/api/ApiRequestTrace";
import { GetApiBaseUrl } from "@/app/src/services/shared/api/ApiUrl";

export class ApiClientError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, options: { code?: string; status?: number } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.code = options.code;
    this.status = options.status;
  }
}

export function IsUnauthorizedApiError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    (error.status === 401 || error.status === 403)
  );
}

export const ApiClient = axios.create({
  baseURL: GetApiBaseUrl(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

ApiClient.interceptors.request.use((config) => {
  const accessToken = GetAccessToken();

  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers);

    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    config.headers = headers;
  }

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
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return Promise.reject(
        new ApiClientError(message.join(" "), {
          code: error.code,
          status,
        }),
      );
    }

    if (typeof message === "string") {
      return Promise.reject(
        new ApiClientError(message, {
          code: error.code,
          status,
        }),
      );
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new ApiClientError("The request timed out.", {
          code: error.code,
          status,
        }),
      );
    }

    return Promise.reject(
      new ApiClientError(error.message || "Request failed.", {
        code: error.code,
        status,
      }),
    );
  },
);

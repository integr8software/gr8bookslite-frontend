import axios from "axios";
import {
  FinishApiRequestTrace,
  StartApiRequestTrace,
} from "@/app/src/services/shared/api/ApiRequestTrace";
import {
  BuildApiRequestDedupeKey,
  RunDedupedApiRequest,
} from "@/app/src/services/shared/api/ApiRequestDeduper";
import { GetApiBaseUrl } from "@/app/src/services/shared/api/ApiUrl";
import { NotifyAuthSessionExpired } from "@/app/src/services/auth/AuthSessionExpired";

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
      console.log("[api:error] unexpected client error", error);
      return Promise.reject(error);
    }

    FinishApiRequestTrace(error.config, error.response?.status);
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const method = error.config?.method?.toUpperCase() ?? "REQUEST";
    const url = error.config?.url ?? "unknown URL";

    console.log(`[api:error] ${method} ${url} failed`, {
      status,
      code: error.code,
      message,
      response: error.response?.data,
    });

    if (status === 401) {
      NotifyAuthSessionExpired();
    }

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

const RawApiClientRequest = ApiClient.request.bind(ApiClient);

ApiClient.request = ((config) => {
  const key = BuildApiRequestDedupeKey({
    baseURL: config.baseURL,
    data: config.data,
    method: config.method,
    params: config.params,
    url: config.url,
  });

  return RunDedupedApiRequest({ key }, () => RawApiClientRequest(config));
}) as typeof ApiClient.request;

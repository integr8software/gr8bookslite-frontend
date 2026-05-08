import axios from "axios";

const API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";

function NormalizeApiBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function GetApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!value) {
    throw new Error(
      `Missing ${API_BASE_URL_ENV}. Add it to your frontend environment variables.`,
    );
  }

  return NormalizeApiBaseUrl(value);
}

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

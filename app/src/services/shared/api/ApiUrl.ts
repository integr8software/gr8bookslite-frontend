const API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";
const BFF_API_BASE_URL = "/api/backend";

function NormalizeApiBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function GetApiBaseUrl() {
  if (typeof window !== "undefined") {
    return BFF_API_BASE_URL;
  }

  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new Error(
      `Missing ${API_BASE_URL_ENV}. Add it to your frontend environment variables.`,
    );
  }

  return NormalizeApiBaseUrl(value);
}

export function BuildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${GetApiBaseUrl()}${normalizedPath}`;
}

const API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";

function NormalizeApiBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function GetAuthApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!value) {
    throw new AuthApiError(
      `Missing ${API_BASE_URL_ENV}. Add it to your frontend environment variables.`,
    );
  }

  return NormalizeApiBaseUrl(value);
}

export function BuildAuthApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${GetAuthApiBaseUrl()}${normalizedPath}`;
}

export function BuildGoogleAuthUrl(mode: "login" | "signup") {
  return BuildAuthApiUrl(`/auth/google?mode=${mode}`);
}

type ApiErrorPayload = {
  message?: string | string[];
};

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

function ReadApiErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
  if (!payload?.message) {
    return fallback;
  }

  return Array.isArray(payload.message)
    ? payload.message.join(" ")
    : payload.message;
}

export async function PostAuthJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(BuildAuthApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | TResponse
    | ApiErrorPayload
    | null;

  if (!response.ok) {
    throw new AuthApiError(
      ReadApiErrorMessage(payload as ApiErrorPayload | null, "Request failed."),
    );
  }

  return payload as TResponse;
}

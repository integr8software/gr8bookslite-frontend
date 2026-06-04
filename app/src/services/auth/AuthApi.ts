import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  AuthProfileResponse,
  ChangeAuthenticatedPasswordRequest,
  ChangeAuthenticatedPasswordResponse,
  RequestPasswordChangeOtpResponse,
  SwitchCompanyContextResponse,
  VerifyPasswordChangeOtpRequest,
  VerifyPasswordChangeOtpResponse,
} from "@/app/src/services/auth/AuthApiTypes";
import { BuildApiUrl, GetApiBaseUrl } from "@/app/src/services/shared/api/ApiUrl";

export function BuildAuthApiUrl(path: string) {
  try {
    return BuildApiUrl(path);
  } catch (error) {
    throw new AuthApiError(
      error instanceof Error ? error.message : "Missing API base URL.",
    );
  }
}

export const GetAuthApiBaseUrl = GetApiBaseUrl;

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
    credentials: "include",
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

function GetOptionalAuthorizationHeaders(accessToken: string | null) {
  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function GetAuthProfile(accessToken: string | null = null) {
  const response = await ApiClient.get<AuthProfileResponse>("/auth/me", {
    headers: GetOptionalAuthorizationHeaders(accessToken),
    timeout: 10000,
  });

  return response.data;
}

export async function CreateFrontendAuthSession(
  accessToken: string,
  rememberMe = false,
) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ accessToken, rememberMe }),
  });

  if (!response.ok) {
    throw new AuthApiError("Could not update the browser session.");
  }
}

export async function GetFrontendAuthSession(timeoutMs = 3000) {
  const abortController = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  let response: Response;

  try {
    response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: abortController.signal,
    });
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as {
    accessToken?: string;
  } | null;
  const accessToken = payload?.accessToken?.trim();

  return accessToken || null;
}

export async function SwitchCompanyContext(
  accessToken: string | null,
  companyId: number,
) {
  const response = await ApiClient.post<SwitchCompanyContextResponse>(
    "/auth/context/company",
    { companyId },
    {
      headers: GetOptionalAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function RequestPasswordChangeOtp(accessToken: string | null = null) {
  const response = await ApiClient.post<RequestPasswordChangeOtpResponse>(
    "/auth/me/password/otp",
    undefined,
    {
      headers: GetOptionalAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function VerifyPasswordChangeOtp(
  accessToken: string | null,
  body: VerifyPasswordChangeOtpRequest,
) {
  const response = await ApiClient.post<VerifyPasswordChangeOtpResponse>(
    "/auth/me/password/verify-otp",
    body,
    {
      headers: GetOptionalAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function ChangeAuthenticatedPassword(
  accessToken: string | null,
  body: ChangeAuthenticatedPasswordRequest,
) {
  const response = await ApiClient.patch<ChangeAuthenticatedPasswordResponse>(
    "/auth/me/password",
    body,
    {
      headers: GetOptionalAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

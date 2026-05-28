import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  AuthProfileResponse,
  ChangeAuthenticatedPasswordRequest,
  ChangeAuthenticatedPasswordResponse,
  RequestPasswordChangeOtpResponse,
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
  });

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

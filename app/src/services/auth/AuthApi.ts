import axios from "axios";
import {
  ApiClient,
  ApiClientError,
} from "@/app/src/services/shared/api/ApiClient";
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

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

export async function PostAuthJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  try {
    const response = await ApiClient.post<TResponse>(path, body);

    return response.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new AuthApiError(error.message);
    }

    throw new AuthApiError(
      error instanceof Error ? error.message : "Request failed.",
    );
  }
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
  try {
    await axios.post(
      "/api/auth/session",
      { accessToken, rememberMe },
      {
        withCredentials: true,
      },
    );
  } catch {
    throw new AuthApiError("Could not update the browser session.");
  }
}

export async function GetFrontendAuthSession(timeoutMs = 3000) {
  try {
    const response = await axios.get<{ accessToken?: string }>(
      "/api/auth/session",
      {
        timeout: timeoutMs,
        withCredentials: true,
      },
    );
    const accessToken = response.data.accessToken?.trim();

    return accessToken || null;
  } catch {
    return null;
  }
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

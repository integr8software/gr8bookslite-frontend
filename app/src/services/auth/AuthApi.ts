import axios from "axios";
import { ApiClient, ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type {
  AuthProfile,
  AuthenticatedPasswordChangeInput,
  AuthenticatedPasswordChangeResult,
  LoginCredentials,
  PasswordChangeOtpResult,
  CompanyContextSwitchResult,
  PasswordChangeOtpVerificationInput,
  PasswordChangeOtpVerificationResult,
} from "@/app/src/types/auth/AuthTypes";
import { AuthenticatedSessionMarker, IsClientAuthSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import { BuildApiUrl, GetApiBaseUrl } from "@/app/src/services/shared/api/ApiUrl";

export function BuildAuthApiUrl(path: string) {
  try {
    return BuildApiUrl(path);
  } catch (error) {
    throw new AuthApiError(error instanceof Error ? error.message : "Missing API base URL.");
  }
}

export const GetAuthApiBaseUrl = GetApiBaseUrl;
const AuthRequestTimeoutMs = 60000;
const FrontendAuthClient = axios.create({
  timeout: AuthRequestTimeoutMs,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type FrontendLoginResult = {
  message?: string;
  pendingVerificationEmail?: string;
  redirectTo?: string;
};

export function BuildGoogleAuthUrl(mode: "login" | "signup") {
  return `/api/auth/google?mode=${mode}`;
}

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

function GetFrontendAuthErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (typeof message === "string") {
    return message;
  }

  return error.message || fallbackMessage;
}

export async function PostAuthJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  try {
    const response = await ApiClient.post<TResponse>(path, body, {
      timeout: AuthRequestTimeoutMs,
    });

    return response.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new AuthApiError(error.message);
    }

    throw new AuthApiError(error instanceof Error ? error.message : "Request failed.");
  }
}

function GetOptionalAuthorizationHeaders(accessToken: string | null) {
  if (!accessToken || IsClientAuthSessionMarker(accessToken)) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function GetAuthProfile(accessToken: string | null = null) {
  const response = await ApiClient.get<AuthProfile>("/auth/me", {
    headers: GetOptionalAuthorizationHeaders(accessToken),
    timeout: AuthRequestTimeoutMs,
  });

  return response.data;
}

export async function CreateFrontendAuthSession(accessToken: string, rememberMe = false) {
  try {
    await FrontendAuthClient.post("/api/auth/session", { accessToken, rememberMe });
  } catch {
    throw new AuthApiError("Could not update the browser session.");
  }
}

export async function GetFrontendAuthSession(timeoutMs = 3000) {
  try {
    const response = await FrontendAuthClient.get<{ authenticated?: boolean }>("/api/auth/session", {
      timeout: timeoutMs,
    });

    return response.data.authenticated ? AuthenticatedSessionMarker : null;
  } catch {
    return null;
  }
}

export async function EnsureFrontendAuthSession(timeoutMs = 3000) {
  try {
    const response = await FrontendAuthClient.get<{ authenticated?: boolean }>("/api/auth/session", {
      timeout: timeoutMs,
    });

    if (!response.data.authenticated) {
      throw new AuthApiError("Login worked, but Safari did not save the session cookie.");
    }
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError("Login worked, but Safari did not save the session cookie.");
  }
}

export async function LoginWithFrontendAuthSession(credentials: LoginCredentials) {
  try {
    const response = await FrontendAuthClient.post<FrontendLoginResult>("/api/auth/login", credentials, {
      headers: {
        "Cache-Control": "no-store",
      },
    });

    await EnsureFrontendAuthSession();

    return response.data;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError(GetFrontendAuthErrorMessage(error, "Email or Password is incorrect."));
  }
}

export async function SwitchCompanyContext(accessToken: string | null, companyId: number) {
  const response = await FrontendAuthClient.post<CompanyContextSwitchResult>(
    "/api/auth/context/company",
    { companyId },
    {
      headers: GetOptionalAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function RequestPasswordChangeOtp(accessToken: string | null = null) {
  const response = await ApiClient.post<PasswordChangeOtpResult>("/auth/me/password/otp", undefined, {
    headers: GetOptionalAuthorizationHeaders(accessToken),
  });

  return response.data;
}

export async function VerifyPasswordChangeOtp(accessToken: string | null, body: PasswordChangeOtpVerificationInput) {
  const response = await ApiClient.post<PasswordChangeOtpVerificationResult>("/auth/me/password/verify-otp", body, {
    headers: GetOptionalAuthorizationHeaders(accessToken),
  });

  return response.data;
}

export async function ChangeAuthenticatedPassword(accessToken: string | null, body: AuthenticatedPasswordChangeInput) {
  const response = await ApiClient.patch<AuthenticatedPasswordChangeResult>("/auth/me/password", body, {
    headers: GetOptionalAuthorizationHeaders(accessToken),
  });

  return response.data;
}

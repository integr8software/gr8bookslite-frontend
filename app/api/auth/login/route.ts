import { NextResponse } from "next/server";
import { FetchBackend } from "@/app/src/services/auth/AuthBackendServer";
import { SetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";
import type { LoginCredentials, LoginResult } from "@/app/src/types/auth/AuthTypes";
import { GetFallbackPostAuthRedirectPath } from "@/app/src/services/auth/AuthRedirects";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as LoginCredentials | null;
    const response = await FetchBackend("/auth/login", {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as LoginResult | { message?: string } | null;

    console.log("[auth/login] backend response", {
      hasAccessToken: Boolean(payload && "accessToken" in payload && payload.accessToken),
      payloadKeys: payload ? Object.keys(payload) : [],
      status: response.status,
    });

    if (!response.ok) {
      return NextResponse.json(payload ?? { message: "Login failed." }, { status: response.status });
    }

    if (!payload || !("accessToken" in payload) || !payload.accessToken) {
      return NextResponse.json(
        {
          code: "AUTH_SESSION_TOKEN_MISSING",
          message: payload?.message ?? "Login succeeded, but the backend did not return a session token.",
        },
        { status: 502 },
      );
    }

    await SetAuthAccessTokenCookie(payload.accessToken, Boolean(body?.rememberMe));

    return NextResponse.json(
      {
        message: payload.message ?? "Login successful.",
        redirectTo: GetFallbackPostAuthRedirectPath(payload.accessToken),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.log("[auth/login] backend request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        code: "AUTH_BACKEND_UNAVAILABLE",
        message: "The authentication service could not be reached.",
      },
      { status: 502 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  FetchBackend,
} from "@/app/src/services/auth/AuthBackendServer";
import { SetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";
import type {
  LoginRequest,
  LoginResponse,
} from "@/app/src/services/auth/AuthApiTypes";
import { GetFallbackPostAuthRedirectPath } from "@/app/src/services/auth/AuthRedirects";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginRequest | null;
  console.log("[auth/login] request received", {
    hasEmail: Boolean(body?.email),
    rememberMe: Boolean(body?.rememberMe),
  });
  const response = await FetchBackend("/auth/login", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as
    | LoginResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    console.log("[auth/login] backend rejected login", {
      status: response.status,
      message: payload?.message,
    });
    return NextResponse.json(
      payload ?? { message: "Login failed." },
      { status: response.status },
    );
  }

  if (!payload || !("accessToken" in payload) || !payload.accessToken) {
    return NextResponse.json(
      { message: "We could not create your login session right now." },
      { status: 502 },
    );
  }

  await SetAuthAccessTokenCookie(payload.accessToken, Boolean(body?.rememberMe));
  console.log("[auth/login] frontend cookie set", {
    hasAccessToken: Boolean(payload.accessToken),
    redirectTo: GetFallbackPostAuthRedirectPath(payload.accessToken),
  });

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
}

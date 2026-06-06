import { NextResponse } from "next/server";
import {
  GetAuthAccessTokenCookie,
  SetAuthAccessTokenCookie,
} from "@/app/src/services/auth/AuthCookieServer";

type AuthSessionRequestBody = {
  accessToken?: string;
  rememberMe?: boolean;
};

export async function GET() {
  const accessToken = await GetAuthAccessTokenCookie();
  console.log("[auth/session] cookie lookup", {
    hasAccessToken: Boolean(accessToken),
  });

  if (!accessToken) {
    return NextResponse.json(
      { message: "No active session." },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 401,
      },
    );
  }

  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | AuthSessionRequestBody
    | null;
  const accessToken = body?.accessToken?.trim();
  console.log("[auth/session] create request", {
    hasAccessToken: Boolean(accessToken),
    rememberMe: Boolean(body?.rememberMe),
  });

  if (!accessToken) {
    return NextResponse.json(
      { message: "Missing access token." },
      { status: 400 },
    );
  }

  await SetAuthAccessTokenCookie(accessToken, Boolean(body?.rememberMe));

  return NextResponse.json({ authenticated: true, message: "Session created." });
}

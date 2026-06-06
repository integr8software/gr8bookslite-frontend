import { NextResponse } from "next/server";
import { FetchBackend } from "@/app/src/services/auth/AuthBackendServer";
import { SetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";

type GoogleSessionRequest = {
  handoffCode?: string;
};

type GoogleSessionResponse = {
  accessToken?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | GoogleSessionRequest
    | null;
  const handoffCode = body?.handoffCode?.trim();

  if (!handoffCode) {
    return NextResponse.json(
      { message: "Missing Google sign-in session." },
      { status: 400 },
    );
  }

  const response = await FetchBackend("/auth/google/session", {
    body: JSON.stringify({ handoffCode }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as
    | GoogleSessionResponse
    | null;

  if (!response.ok || !payload?.accessToken) {
    return NextResponse.json(
      payload ?? { message: "Google sign-in session could not be created." },
      { status: response.ok ? 502 : response.status },
    );
  }

  await SetAuthAccessTokenCookie(payload.accessToken, false);

  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

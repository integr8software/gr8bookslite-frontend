import { NextResponse } from "next/server";
import {
  FetchBackend,
} from "@/app/src/services/auth/AuthBackendServer";
import { SetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";
import type { SwitchCompanyContextResponse } from "@/app/src/services/auth/AuthApiTypes";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await FetchBackend("/auth/context/company", {
    body,
    inputHeaders: request.headers,
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as
    | SwitchCompanyContextResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      payload ?? { message: "Company context switch failed." },
      { status: response.status },
    );
  }

  if (payload && "accessToken" in payload && payload.accessToken) {
    await SetAuthAccessTokenCookie(payload.accessToken, false);
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

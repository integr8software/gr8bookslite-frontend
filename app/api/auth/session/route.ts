import { NextResponse } from "next/server";
import { SetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";

type AuthSessionRequestBody = {
  accessToken?: string;
  rememberMe?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | AuthSessionRequestBody
    | null;
  const accessToken = body?.accessToken?.trim();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Missing access token." },
      { status: 400 },
    );
  }

  await SetAuthAccessTokenCookie(accessToken, Boolean(body?.rememberMe));

  return NextResponse.json({ message: "Session created." });
}

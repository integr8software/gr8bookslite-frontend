import { NextResponse } from "next/server";
import { FetchBackend } from "@/app/src/services/auth/AuthBackendServer";
import { ClearAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";

export async function POST() {
  await FetchBackend("/auth/logout", {
    method: "POST",
  }).catch(() => null);
  await ClearAuthAccessTokenCookie();

  return NextResponse.json({ message: "Logged out." });
}

import { NextResponse } from "next/server";
import { ClearAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";

export async function POST() {
  await ClearAuthAccessTokenCookie();

  return NextResponse.json({ message: "Logged out." });
}

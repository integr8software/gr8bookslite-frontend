import { NextResponse, type NextRequest } from "next/server";
import { BuildBackendApiUrl } from "@/app/src/services/auth/AuthBackendServer";

export function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode");
  const targetUrl = new URL(BuildBackendApiUrl("/auth/google"));

  if (mode === "signup" || mode === "login") {
    targetUrl.searchParams.set("mode", mode);
  }

  return NextResponse.redirect(targetUrl);
}

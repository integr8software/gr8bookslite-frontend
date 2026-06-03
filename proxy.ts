import type { NextRequest } from "next/server";
import { ResolveAuthProxyResponse } from "@/app/src/services/auth/AuthProxyGuard";

export function proxy(request: NextRequest) {
  return ResolveAuthProxyResponse(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\..*).*)",
  ],
};

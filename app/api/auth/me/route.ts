import { NextResponse } from "next/server";
import {
  FetchBackend,
} from "@/app/src/services/auth/AuthBackendServer";
import type { AuthProfileResponse } from "@/app/src/services/auth/AuthApiTypes";

export async function GET() {
  const response = await FetchBackend("/auth/me", {
    method: "GET",
  });
  console.log("[auth/me] backend response", {
    status: response.status,
  });
  const payload = (await response.json().catch(() => null)) as
    | AuthProfileResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      payload ?? { message: "No active session." },
      { status: response.status },
    );
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

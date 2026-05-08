"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BuildAuthApiUrl,
  GetAuthApiBaseUrl,
} from "@/app/src/services/auth/AuthApi";
import { ClearAccessToken, GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { ClearPendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

export function LogoutPage() {
  const router = useRouter();
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  useEffect(() => {
    const accessToken = GetAccessToken();

    void (async () => {
      try {
        if (accessToken) {
          await fetch(BuildAuthApiUrl("/auth/logout"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          });
        } else {
          GetAuthApiBaseUrl();
        }
      } catch {
        // Logout should still succeed locally even if the backend request fails.
      } finally {
        ClearAccessToken();
        ClearPendingVerificationEmail();
        resetAppStore();
        router.replace("/login");
      }
    })();
  }, [resetAppStore, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 text-darknavy">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Signing out</h1>
        <p className="mt-2 text-sm text-darknavy/70">
          Clearing your session and redirecting to login.
        </p>
      </div>
    </main>
  );
}

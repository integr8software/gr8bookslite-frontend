"use client";

import { useRouter } from "next/navigation";
import { ClearAccessToken, GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { ClearPendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  BuildAuthApiUrl,
  GetAuthApiBaseUrl,
} from "@/app/src/services/auth/AuthApi";

export function useLogout() {
  const router = useRouter();
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  return async function logout() {
    const accessToken = GetAccessToken();

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
  };
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ClearAccessToken, GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { ClearPendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { BuildAuthApiUrl } from "@/app/src/services/auth/AuthApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  return async function logout() {
    const accessToken = GetAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      await fetch(BuildAuthApiUrl("/auth/logout"), {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // Logout should still clear the frontend session even if the backend request fails.
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Local logout should still complete even if the cookie clear route fails.
    } finally {
      ClearAccessToken();
      ClearPendingVerificationEmail();
      queryClient.clear();
      queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
      resetAppStore();
      router.replace("/login");
      router.refresh();
    }
  };
}

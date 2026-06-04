"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ClearAccessToken, GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { ClearPendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { ClearAiAssistantStorage } from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { BuildAuthApiUrl } from "@/app/src/services/auth/AuthApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const beginShellContextSwitch = useAppStore(
    (state) => state.beginShellContextSwitch,
  );
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  return async function logout() {
    const accessToken = GetAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    beginShellContextSwitch("Logging out...");

    try {
      await fetch(BuildAuthApiUrl("/auth/logout"), {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // Local logout should still complete when the backend is unavailable.
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Local logout should still complete when cookie clearing fails.
    } finally {
      ClearAccessToken();
      ClearPendingVerificationEmail();
      ClearAiAssistantStorage();
      queryClient.clear();
      queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
      resetAppStore();
      router.replace("/login");
      router.refresh();
    }
  };
}

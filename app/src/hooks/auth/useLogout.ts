"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ClearAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { ClearPendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { ClearAiAssistantStorage } from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const beginShellContextSwitch = useAppStore(
    (state) => state.beginShellContextSwitch,
  );
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  return async function logout() {
    beginShellContextSwitch("Logging out...");

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
      beginShellContextSwitch("Logging out...");
      router.replace("/login");
      router.refresh();
    }
  };
}

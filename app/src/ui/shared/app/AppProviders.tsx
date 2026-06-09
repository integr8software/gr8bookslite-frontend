"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AuthenticatedSessionMarker,
  ClearLegacyAuthStorage,
} from "@/app/src/data/auth/AuthSessionStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { GetFrontendAuthSession } from "@/app/src/services/auth/AuthApi";
import { CreateQueryClient } from "@/app/src/services/shared/app/QueryClient";
import {
  AuthSessionExpiredEventName,
} from "@/app/src/services/auth/AuthSessionExpired";
import { AppThemeEffect } from "@/app/src/ui/shared/app/AppThemeEffect";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(CreateQueryClient);
  const pathname = usePathname();
  const router = useRouter();
  const [isSessionExpiredDialogOpen, setIsSessionExpiredDialogOpen] =
    useState(false);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const setIsAuthSessionReady = useAppStore(
    (state) => state.setIsAuthSessionReady,
  );
  const setActiveBranchContext = useAppStore(
    (state) => state.setActiveBranchContext,
  );
  const setActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
  const setActiveCompanyName = useAppStore(
    (state) => state.setActiveCompanyName,
  );

  useEffect(() => {
    let isActive = true;

    async function hydrateAuthSession() {
      try {
        const frontendSessionAccessToken = await GetFrontendAuthSession();

        if (!isActive) {
          return;
        }

        if (frontendSessionAccessToken) {
          setAccessToken(AuthenticatedSessionMarker);
        }
      } catch {
        // The protected page can still finish hydration and let route guards handle auth.
      } finally {
        if (isActive) {
          setIsAuthSessionReady(true);
        }
      }
    }

    void hydrateAuthSession();

    return () => {
      isActive = false;
    };
  }, [setAccessToken, setIsAuthSessionReady]);

  useEffect(() => {
    function handleSessionExpired() {
      if (pathname === "/login") {
        return;
      }

      setIsSessionExpiredDialogOpen(true);
    }

    window.addEventListener(AuthSessionExpiredEventName, handleSessionExpired);

    return () => {
      window.removeEventListener(AuthSessionExpiredEventName, handleSessionExpired);
    };
  }, [pathname]);

  async function redirectToLogin() {
    ClearLegacyAuthStorage();
    setAccessToken(null);
    setActiveCompanyId(null);
    setActiveCompanyName(null);
    setActiveBranchContext(null);
    queryClient.clear();
    setIsSessionExpiredDialogOpen(false);

    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    }).catch(() => {
      // The browser session is already invalid; continue to login.
    });

    router.replace("/login?force=true");
    router.refresh();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeEffect />
      {children}
      <AppDialog
        isOpen={isSessionExpiredDialogOpen}
        title="Session timed out"
        description="Your session has expired. Please log in again to continue using Gr8Books Neo."
        confirmLabel="Log in again"
        pendingLabel="Redirecting..."
        showCancel={false}
        tone="danger"
        onCancel={() => void redirectToLogin()}
        onConfirm={redirectToLogin}
      />
    </QueryClientProvider>
  );
}

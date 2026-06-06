"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthenticatedSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { GetFrontendAuthSession } from "@/app/src/services/auth/AuthApi";
import { CreateQueryClient } from "@/app/src/services/shared/app/QueryClient";
import { AppThemeEffect } from "@/app/src/ui/shared/app/AppThemeEffect";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(CreateQueryClient);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const setIsAuthSessionReady = useAppStore(
    (state) => state.setIsAuthSessionReady,
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeEffect />
      {children}
    </QueryClientProvider>
  );
}

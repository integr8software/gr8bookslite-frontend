"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  GetAccessToken,
  GetRememberMePreference,
  SaveAccessToken,
} from "@/app/src/data/auth/AuthSessionStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { CreateQueryClient } from "@/app/src/services/shared/app/QueryClient";
import { AppThemeEffect } from "@/app/src/ui/shared/app/AppThemeEffect";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(CreateQueryClient);
  const accessToken = useAppStore((state) => state.accessToken);
  const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const setIsAuthSessionReady = useAppStore(
    (state) => state.setIsAuthSessionReady,
  );

  useEffect(() => {
    try {
      const hydratedAccessToken = GetAccessToken();

      if (hydratedAccessToken) {
        setAccessToken(hydratedAccessToken);
      }
    } finally {
      setIsAuthSessionReady(true);
    }
  }, [setAccessToken, setIsAuthSessionReady]);

  useEffect(() => {
    if (!isAuthSessionReady || !accessToken) {
      return;
    }

    SaveAccessToken(accessToken, GetRememberMePreference());
  }, [accessToken, isAuthSessionReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeEffect />
      {children}
    </QueryClientProvider>
  );
}

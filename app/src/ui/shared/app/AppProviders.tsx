"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
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
    setAccessToken(GetAccessToken());
    setIsAuthSessionReady(true);
  }, [setAccessToken, setIsAuthSessionReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeEffect />
      {children}
    </QueryClientProvider>
  );
}

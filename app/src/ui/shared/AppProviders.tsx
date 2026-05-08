"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import { CreateQueryClient } from "@/app/src/services/shared/QueryClient";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(CreateQueryClient);
  const setAccessToken = useAppStore((state) => state.setAccessToken);

  useEffect(() => {
    setAccessToken(GetAccessToken());
  }, [setAccessToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

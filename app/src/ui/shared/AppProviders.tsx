"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CreateQueryClient } from "@/app/src/services/shared/QueryClient";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(CreateQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

import { QueryClient } from "@tanstack/react-query";

const DefaultQueryStaleTime = 5 * 60 * 1000;

const DefaultQueryGcTime = 15 * 60 * 1000;

export function CreateQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DefaultQueryStaleTime,
        gcTime: DefaultQueryGcTime,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

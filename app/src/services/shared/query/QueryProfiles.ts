import type { QueryKey } from "@tanstack/react-query";

export const QueryStaleTimes = {
  realtime: 0,
  short: 60 * 1000,
  reference: 10 * 60 * 1000,
  session: 5 * 60 * 1000,
} as const;

export function CreateReferenceQueryOptions<
  TQueryKey extends QueryKey,
  TData,
>(queryKey: TQueryKey, queryFn: () => Promise<TData>) {
  return {
    queryKey,
    queryFn,
    staleTime: QueryStaleTimes.reference,
  };
}

export function CreateSessionQueryOptions<TQueryKey extends QueryKey, TData>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TData>,
) {
  return {
    queryKey,
    queryFn,
    staleTime: QueryStaleTimes.session,
  };
}

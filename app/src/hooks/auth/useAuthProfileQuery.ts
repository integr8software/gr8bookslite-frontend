"use client";

import { useQuery } from "@tanstack/react-query";
import { GetAuthProfile } from "@/app/src/services/auth/AuthApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

type UseAuthProfileQueryParams = {
  accessToken: string | null;
  enabled?: boolean;
};

export function useAuthProfileQuery({
  accessToken,
  enabled = true,
}: UseAuthProfileQueryParams) {
  return useQuery({
    enabled,
    queryKey: AuthQueryKeys.profile(),
    queryFn: async () => GetAuthProfile(accessToken),
    retry: false,
  });
}

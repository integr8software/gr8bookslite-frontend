"use client";

import { useQuery } from "@tanstack/react-query";
import { GetAuthProfile } from "@/app/src/services/auth/AuthApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

type UseAuthProfileQueryParams = {
  accessToken: string | null;
};

export function useAuthProfileQuery({
  accessToken,
}: UseAuthProfileQueryParams) {
  return useQuery({
    queryKey: AuthQueryKeys.profile(accessToken),
    queryFn: async () => GetAuthProfile(accessToken as string),
    enabled: Boolean(accessToken),
  });
}

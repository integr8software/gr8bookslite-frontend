"use client";

import { useQuery } from "@tanstack/react-query";
import { GetAuthProfile } from "@/app/src/services/auth/AuthApi";
import {
  AuthQueryKeys,
  CreateAuthAccessTokenQueryScope,
} from "@/app/src/services/auth/AuthQueryKeys";

type UseAuthProfileQueryParams = {
  accessToken: string | null;
  enabled?: boolean;
};

export function useAuthProfileQuery({
  accessToken,
  enabled = true,
}: UseAuthProfileQueryParams) {
  return useQuery({
    enabled: enabled && Boolean(accessToken),
    queryKey: AuthQueryKeys.profile(
      CreateAuthAccessTokenQueryScope(accessToken),
    ),
    queryFn: async () => GetAuthProfile(accessToken),
    retry: false,
  });
}

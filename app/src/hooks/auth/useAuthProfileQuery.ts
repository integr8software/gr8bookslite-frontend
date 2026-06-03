"use client";

import { useQuery } from "@tanstack/react-query";
import { GetAuthProfile } from "@/app/src/services/auth/AuthApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

type UseAuthProfileQueryParams = {
  accessToken: string | null;
  enabled?: boolean;
};

function CreateAccessTokenQueryScope(accessToken: string | null) {
  if (!accessToken) {
    return null;
  }

  let hash = 0;

  for (let index = 0; index < accessToken.length; index += 1) {
    hash = (hash * 31 + accessToken.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function useAuthProfileQuery({
  accessToken,
  enabled = true,
}: UseAuthProfileQueryParams) {
  return useQuery({
    enabled: enabled && Boolean(accessToken),
    queryKey: AuthQueryKeys.profile(CreateAccessTokenQueryScope(accessToken)),
    queryFn: async () => GetAuthProfile(accessToken),
    retry: false,
  });
}

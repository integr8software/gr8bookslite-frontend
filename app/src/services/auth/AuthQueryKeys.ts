export function CreateAuthAccessTokenQueryScope(accessToken: string | null) {
  if (!accessToken) {
    return null;
  }

  let hash = 0;

  for (let index = 0; index < accessToken.length; index += 1) {
    hash = (hash * 31 + accessToken.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export const AuthQueryKeys = {
  all: ["auth"] as const,
  profiles: () => [...AuthQueryKeys.all, "profile"] as const,
  profile: (tokenScope: string | null = null) =>
    [...AuthQueryKeys.profiles(), tokenScope] as const,
};

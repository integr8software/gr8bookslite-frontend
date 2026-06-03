export const AuthQueryKeys = {
  all: ["auth"] as const,
  profile: (tokenScope: string | null = null) =>
    [...AuthQueryKeys.all, "profile", tokenScope] as const,
};

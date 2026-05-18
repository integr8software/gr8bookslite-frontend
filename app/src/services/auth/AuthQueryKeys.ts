export const AuthQueryKeys = {
  all: ["auth"] as const,
  profile: (accessToken: string | null) =>
    [...AuthQueryKeys.all, "profile", accessToken] as const,
};

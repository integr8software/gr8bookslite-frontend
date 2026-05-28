export const AuthQueryKeys = {
  all: ["auth"] as const,
  profile: () => [...AuthQueryKeys.all, "profile"] as const,
};

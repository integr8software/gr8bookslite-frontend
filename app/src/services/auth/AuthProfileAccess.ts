import type {
  AuthMembershipRole,
  AuthProfileResponse,
} from "@/app/src/services/auth/AuthApiTypes";

export type AuthEffectiveRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export function GetAuthProfileAccess(profile: AuthProfileResponse | undefined) {
  return profile?.activeAccess ?? profile?.access ?? null;
}

export function GetAuthProfileCompanyId(
  profile: AuthProfileResponse | undefined,
) {
  return (
    profile?.activeCompanyId ??
    profile?.companyId ??
    GetAuthProfileAccess(profile)?.companyId ??
    null
  );
}

export function GetAuthProfileMembershipRole(
  profile: AuthProfileResponse | undefined,
): AuthMembershipRole {
  const accessMembershipRole = GetAuthProfileAccess(profile)?.membershipRole;

  if (accessMembershipRole) {
    return accessMembershipRole;
  }

  const activeCompanyId = GetAuthProfileCompanyId(profile);
  const activeCompanyMembership =
    profile?.companies?.find(
      (company) => company.companyId === activeCompanyId,
    ) ?? profile?.companies?.[0];

  return activeCompanyMembership?.role ?? null;
}

export function ResolveAuthProfileEffectiveRole(
  profile: AuthProfileResponse | undefined,
): AuthEffectiveRole {
  if (profile?.user.systemRole === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }

  if (GetAuthProfileMembershipRole(profile) === "ADMIN") {
    return "ADMIN";
  }

  return "USER";
}

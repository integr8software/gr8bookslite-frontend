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
  const access = GetAuthProfileAccess(profile);
  const accessMembershipRole = access?.membershipRole ?? access?.role;

  if (accessMembershipRole) {
    return accessMembershipRole;
  }

  if (profile?.role) {
    return profile.role;
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

import {
  AuthEffectiveRoleCodes,
  AuthMembershipRoleCodes,
  type AuthEffectiveRole,
  type AuthMembershipRole,
  type AuthProfile,
} from "@/app/src/types/auth/AuthTypes";

export function GetAuthProfileAccess(profile: AuthProfile | undefined) {
  return profile?.activeAccess ?? profile?.access ?? null;
}

export function GetAuthProfileCompanyId(profile: AuthProfile | undefined) {
  return profile?.activeCompanyId ?? profile?.companyId ?? GetAuthProfileAccess(profile)?.companyId ?? null;
}

export function GetAuthProfileMembershipRole(profile: AuthProfile | undefined): AuthMembershipRole {
  const access = GetAuthProfileAccess(profile);
  const accessMembershipRole = access?.membershipRole ?? access?.role;

  if (accessMembershipRole) {
    return accessMembershipRole;
  }

  if (profile?.role) {
    return profile.role;
  }

  const activeCompanyId = GetAuthProfileCompanyId(profile);
  const activeCompanyMembership = profile?.companies?.find((company) => company.companyId === activeCompanyId) ?? profile?.companies?.[0];

  return activeCompanyMembership?.role ?? null;
}

export function ResolveAuthProfileEffectiveRole(profile: AuthProfile | undefined): AuthEffectiveRole {
  if (profile?.user.systemRole === AuthEffectiveRoleCodes.SuperAdmin) {
    return AuthEffectiveRoleCodes.SuperAdmin;
  }

  if (GetAuthProfileMembershipRole(profile) === AuthMembershipRoleCodes.Admin) {
    return AuthEffectiveRoleCodes.Admin;
  }

  return AuthEffectiveRoleCodes.User;
}

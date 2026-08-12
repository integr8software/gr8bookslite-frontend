import { GetAuthProfile } from "@/app/src/services/auth/AuthApi";
import { GetAuthProfileCompanyId, ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { AuthEffectiveRoleCodes, AuthMembershipRoleCodes, AuthSystemRoleCodes, type AuthProfile } from "@/app/src/types/auth/AuthTypes";
import { OnboardingRoutePath } from "@/app/src/services/auth/AuthRouteConstants";

type AuthJwtPayload = {
  companyId?: number | null;
  systemRole?: string | null;
  membershipRole?: string | null;
};

const SystemRedirectPathPrefixes = [
  "/accounts-payable",
  "/account",
  "/cash-disbursement",
  "/cash-receipt",
  "/dashboard",
  "/general-journal",
  "/inventory",
  "/master",
  "/maintenance",
  "/others",
  "/profile",
  "/purchasing",
  "/reports",
  "/sales",
  "/settings",
  "/system-administration",
  "/workspace",
] as const;

export function IsSystemRedirectPath(path: string | null | undefined) {
  if (!path) {
    return false;
  }

  return SystemRedirectPathPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function IsOnboardingRedirectPath(path: string | null | undefined) {
  return path === OnboardingRoutePath || path?.startsWith(`${OnboardingRoutePath}/`);
}

function NormalizeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;

  if (padding === 0) {
    return normalized;
  }

  return normalized.padEnd(normalized.length + (4 - padding), "=");
}

function DecodeJwtPayloadSegment(segment: string) {
  const normalized = NormalizeBase64Url(segment);

  if (typeof window === "undefined") {
    return Buffer.from(normalized, "base64").toString("utf8");
  }

  const binary = window.atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function ReadAuthJwtPayload(accessToken: string | null | undefined): AuthJwtPayload | null {
  if (!accessToken) {
    return null;
  }

  const parts = accessToken.split(".");

  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    return JSON.parse(DecodeJwtPayloadSegment(parts[1])) as AuthJwtPayload;
  } catch {
    return null;
  }
}

export function GetFallbackPostAuthRedirectPath(accessToken: string | null | undefined) {
  const payload = ReadAuthJwtPayload(accessToken);

  if (!payload) {
    return OnboardingRoutePath;
  }

  if (payload.systemRole === AuthSystemRoleCodes.SuperAdmin) {
    return "/master/dashboard";
  }

  if (payload.companyId != null) {
    return "/dashboard";
  }

  if (payload.membershipRole === AuthMembershipRoleCodes.Admin) {
    return "/workspace/dashboard";
  }

  return OnboardingRoutePath;
}

export function GetPostAuthRedirectPathFromProfile(profile: AuthProfile) {
  if (profile.onboarding.requiresCompanySetup) {
    return OnboardingRoutePath;
  }

  const effectiveRole = ResolveAuthProfileEffectiveRole(profile);

  if (effectiveRole === AuthEffectiveRoleCodes.SuperAdmin) {
    return "/master/dashboard";
  }

  if (GetAuthProfileCompanyId(profile) != null) {
    return "/dashboard";
  }

  if (effectiveRole === AuthEffectiveRoleCodes.Admin) {
    return "/workspace/dashboard";
  }

  return OnboardingRoutePath;
}

export async function ResolvePostAuthDestination(accessToken: string | null = null) {
  const profile = await GetAuthProfile(accessToken);

  return {
    profile,
    redirectPath: GetPostAuthRedirectPathFromProfile(profile),
  };
}

import type { AuthProfileResponse } from "@/app/src/services/auth/AuthApiTypes";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import {
  GetAuthProfileAccess,
  GetAuthProfileCompanyId,
  ResolveAuthProfileEffectiveRole,
} from "@/app/src/services/auth/AuthProfileAccess";
import type {
  AccountProfileDraft,
  AccountProfileFieldKey,
  AccountProfileViewModel,
  AccountSettingsItemKey,
  AccountVisibilityConfig,
  AccountVisibilityRole,
} from "@/app/src/types/shared/account/AccountTypes";

const AllRoles: AccountVisibilityRole[] = ["SUPER_ADMIN", "ADMIN", "USER"];

export const AccountProfileFieldVisibility: Array<
  AccountVisibilityConfig<AccountProfileFieldKey>
> = [
  { key: "avatar", visibleTo: AllRoles },
  { key: "fullName", visibleTo: AllRoles },
  { key: "email", visibleTo: AllRoles },
  { key: "contactNumber", visibleTo: AllRoles },
];

export const AccountSettingsItemVisibility: Array<
  AccountVisibilityConfig<AccountSettingsItemKey>
> = [
  { key: "changePassword", visibleTo: AllRoles },
  { key: "theme", visibleTo: AllRoles },
  { key: "accentColor", visibleTo: AllRoles },
  { key: "notificationPreference", visibleTo: AllRoles },
];

export function GetVisibleProfileFields(role: AccountVisibilityRole) {
  return AccountProfileFieldVisibility.filter((field) =>
    field.visibleTo.includes(role),
  ).map((field) => field.key);
}

export function GetVisibleSettingsItems(role: AccountVisibilityRole) {
  return AccountSettingsItemVisibility.filter((field) =>
    field.visibleTo.includes(role),
  ).map((field) => field.key);
}

export function ResolveAccountVisibilityRole(
  profile: AuthProfileResponse | undefined,
): AccountVisibilityRole {
  return ResolveAuthProfileEffectiveRole(profile);
}

export function BuildAccountProfileViewModel(
  profile: AuthProfileResponse | undefined,
  draft: AccountProfileDraft | undefined,
  activeBranchId?: number | null,
): AccountProfileViewModel {
  const role = ResolveAccountVisibilityRole(profile);
  const fullName = draft?.fullName ?? profile?.user.name ?? "Account User";
  const email = profile?.user.email || "No email available";
  const contactNumber =
    draft?.contactNumber ??
    (profile?.user.contactNumber
      ? FormatPhilippineContactNumber(profile.user.contactNumber)
      : "") ??
    "";

  return {
    userId: String(profile?.user.id ?? "local-account-user"),
    role,
    fullName,
    email,
    contactNumber,
    avatarDataUrl:
      draft?.avatarDataUrl !== undefined
        ? draft.avatarDataUrl
        : profile?.user.avatarPublicUrl ?? null,
    initials: BuildInitials(fullName),
    roleLabel: ResolveAccountRoleLabel(profile, role, activeBranchId),
  };
}

function BuildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "AU";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function FormatRoleLabel(role: AccountVisibilityRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    default:
      return "User";
  }
}

function ResolveAccountRoleLabel(
  profile: AuthProfileResponse | undefined,
  role: AccountVisibilityRole,
  activeBranchId?: number | null,
) {
  if (role === "SUPER_ADMIN") {
    return FormatRoleLabel(role);
  }

  const access = GetAuthProfileAccess(profile);
  const activeBranchAccess = access?.userModules?.byBranch?.find(
    (branch) => branch.branchUnitId === activeBranchId,
  );
  const activeCompanyId = GetAuthProfileCompanyId(profile);
  const activeCompanyMembership =
    profile?.companies?.find(
      (company) => company.companyId === activeCompanyId,
    ) ?? profile?.companies?.[0];

  return (
    activeBranchAccess?.companyRoleName ??
    access?.companyRoleName ??
    FormatCompanyRoleName(
      activeBranchAccess?.companyRoleCode ??
        access?.companyRoleCode ??
        activeCompanyMembership?.companyRoleCode,
    ) ??
    FormatRoleLabel(role)
  );
}

function FormatCompanyRoleName(companyRoleCode: string | null | undefined) {
  if (!companyRoleCode) {
    return undefined;
  }

  return companyRoleCode
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

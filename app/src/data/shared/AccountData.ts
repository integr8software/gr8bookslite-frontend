import type { AuthProfileResponse } from "@/app/src/services/auth/AuthApiTypes";
import type {
  AccountProfileDraft,
  AccountProfileFieldKey,
  AccountProfileViewModel,
  AccountSettingsItemKey,
  AccountVisibilityConfig,
  AccountVisibilityRole,
} from "@/app/src/types/shared/AccountTypes";

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
  if (profile?.user.systemRole === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }

  if (profile?.activeAccess?.membershipRole === "ADMIN") {
    return "ADMIN";
  }

  return "USER";
}

export function BuildAccountProfileViewModel(
  profile: AuthProfileResponse | undefined,
  draft: AccountProfileDraft | undefined,
): AccountProfileViewModel {
  const role = ResolveAccountVisibilityRole(profile);
  const fullName = draft?.fullName?.trim() || profile?.user.name || "Account User";
  const email = profile?.user.email || "No email available";
  const contactNumber =
    draft?.contactNumber ??
    profile?.user.contactNumber ??
    "";

  return {
    userId: String(profile?.user.id ?? "local-account-user"),
    role,
    fullName,
    email,
    contactNumber,
    avatarDataUrl: draft?.avatarDataUrl ?? null,
    initials: BuildInitials(fullName),
    roleLabel: FormatRoleLabel(role),
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

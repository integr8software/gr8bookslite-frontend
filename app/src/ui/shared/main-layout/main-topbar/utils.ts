import type {
  MainBranch,
  MainCompany,
} from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import type {
  MainTopbarUser,
  SwitcherVariant,
} from "@/app/src/types/shared/MainTopbarTypes";

export function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function getSwitcherMenuClassName(
  variant: SwitcherVariant,
  mobileTopClass = "top-[7.75rem]",
) {
  const baseClassName =
    "z-50 max-h-[min(24rem,calc(100vh-8rem))] overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.18)]";

  return joinClasses(
    baseClassName,
    variant === "mobile"
      ? joinClasses("fixed left-3 right-3", mobileTopClass)
      : "absolute left-0 top-12 w-[min(20rem,calc(100vw-1.5rem))]",
  );
}

export function getCompanySwitcherDescription(company: MainCompany) {
  const statusLabel = company.status;

  if (company.businessKind || statusLabel) {
    return [statusLabel, company.businessKind].filter(Boolean).join(" - ");
  }

  const branchLabel =
    company.branchName && company.branchCode
      ? `${company.branchName} (${company.branchCode})`
      : company.branchName;

  return [company.helperText, branchLabel].filter(Boolean).join(" - ");
}

export function getBranchLabel(branch: MainBranch) {
  return `${branch.name}${branch.isMain ? " (Head Office)" : ""}`;
}

export function getTopbarUserDescriptor(currentUser: MainTopbarUser) {
  return currentUser.userType?.name ?? getVisibleUserRole(currentUser);
}

export function isLargeNotificationPanel() {
  return typeof window !== "undefined" && window.innerWidth >= 1280;
}

function getVisibleUserRole(currentUser: MainTopbarUser) {
  return currentUser.userRole === "User" ? undefined : currentUser.userRole;
}

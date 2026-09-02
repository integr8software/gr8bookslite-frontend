import type { MainBranch } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";

export type MainNotificationTab = "all" | "unread" | "read";

export type MainBreadcrumbDropdownItem = {
  key: string;
  label: string;
  href: string;
  helperText?: string;
  branchId?: string;
  isManagementAction?: boolean;
  kind?: MainBranch["kind"];
};

export type MainBreadcrumb = {
  key: string;
  label: string;
  href?: string;
  canOpenDropdown?: boolean;
  dropdownItems?: MainBreadcrumbDropdownItem[];
  isLoading?: boolean;
};

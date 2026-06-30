import type {
  MasterAuditLogAction,
  MasterAuditLogDateRange,
  MasterAuditLogResult,
  MasterAuditLogTableColumnKey,
} from "@/app/src/types/master/audit-logs/MasterAuditLogTypes";
import {
  MainWorkspaceSearchItems,
} from "@/app/src/data/shared/main-layout/sidebar/SidebarNavigationData";
import { MainModuleCatalogSearchItems } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const MasterAuditLogsHref = "/master/audit-logs";

export const MasterAuditLogPaginationStorageKey = "master.audit-logs";

export const MasterAuditLogQueryResultLimit = 500;

export const MasterAuditLogDateRangeOptions = [
  { label: "All", value: "all" },
  { label: "Past 24 hours", value: "24h" },
  { label: "Past 7 days", value: "7d" },
  { label: "Past 30 days", value: "30d" },
  { label: "Past 90 days", value: "90d" },
] as const satisfies readonly {
  label: string;
  value: MasterAuditLogDateRange;
}[];

export const MasterAuditLogActionOptions = [
  "Login",
  "Create",
  "Update",
  "Approve",
  "Disapproved",
  "Cancel",
  "Uncancel",
  "Import",
  "Export",
  "Delete",
  "Restore",
  "Suspend",
] as const satisfies readonly MasterAuditLogAction[];

export const MasterAuditLogResultOptions = [
  "Success",
  "Error",
] as const satisfies readonly MasterAuditLogResult[];

export const MasterAuditLogModuleOptions = Array.from(
  new Set(
    [...MainWorkspaceSearchItems, ...MainModuleCatalogSearchItems].map(
      (item) => item.label,
    ),
  ),
).sort((first, second) => first.localeCompare(second));

export const MasterAuditLogTableColumns: {
  key: MasterAuditLogTableColumnKey;
  label: string;
  className: string;
}[] = [
  { key: "companyName", label: "Company", className: "w-[18rem]" },
  { key: "branchName", label: "Branch", className: "w-[13rem]" },
  { key: "module", label: "Module", className: "w-[16rem]" },
  { key: "actorName", label: "User", className: "w-[16rem]" },
  { key: "description", label: "Activity", className: "w-[34rem]" },
  { key: "action", label: "Action", className: "w-[11rem]" },
  { key: "result", label: "Result", className: "w-[10rem]" },
  { key: "createdAt", label: "Date", className: "w-[13rem]" },
];

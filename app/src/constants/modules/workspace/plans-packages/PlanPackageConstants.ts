import type {
  PlanPackagePlanCode,
  PlanPackageStatus,
} from "@/app/src/types/modules/workspace/plans-packages/PlanPackageTypes";

export const PlanPackagesHref = "/workspace/plans-packages";

export const PlanPackagePlanCodeOptions = [
  "ACCOUNTING",
  "INVENTORY",
  "ACCOUNTING_INVENTORY",
] as const satisfies readonly PlanPackagePlanCode[];

export const PlanPackageStatusOptions = [
  "Active",
  "Draft",
  "Inactive",
] as const satisfies readonly PlanPackageStatus[];

export const PlanPackageBillingCycleOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;

export const PlanPackageModuleSearchPlaceholder = "Search modules";

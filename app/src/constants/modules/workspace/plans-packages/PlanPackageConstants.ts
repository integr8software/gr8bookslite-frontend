import type {
  PlanPackageDiscountKind,
  PlanPackageDiscountTarget,
  PlanPackageDiscountType,
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
  "Archived",
] as const satisfies readonly PlanPackageStatus[];

export const PlanPackageDiscountTypeOptions = [
  "Promo",
  "Coupon",
  "Voucher",
] as const satisfies readonly PlanPackageDiscountType[];

export const PlanPackageDiscountKindOptions = [
  "Percent",
  "Fixed",
] as const satisfies readonly PlanPackageDiscountKind[];

export const PlanPackageDiscountTargetOptions = [
  "All Plans",
  "Accounting",
  "Inventory",
  "Accounting + Inventory",
  "Add-ons",
] as const satisfies readonly PlanPackageDiscountTarget[];

export const PlanPackageBillingCycleOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;

export const PlanPackageModuleSearchPlaceholder = "Search modules";

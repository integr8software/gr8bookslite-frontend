import type { MainProductKey } from "@/app/src/data/shared/main-layout/MainLayoutTypes";

export type PlanPackagePlanCode =
  | "ACCOUNTING"
  | "INVENTORY"
  | "ACCOUNTING_INVENTORY";

export type PlanPackageStatus = "Active" | "Draft" | "Inactive";

export type PlanPackageAddOnCode =
  | "ADDITIONAL_COMPANY"
  | "ADDITIONAL_BRANCH"
  | "ADDITIONAL_SATELLITE"
  | "ADDITIONAL_USER";

export type PlanPackagePlanName =
  | "Accounting"
  | "Inventory"
  | "Accounting + Inventory";

export type PlanPackageModuleOption = {
  groupLabel: string;
  href: string;
  key: string;
  label: string;
  productKeys: MainProductKey[];
  sectionTitle: string;
};

export type PlanPackageModuleGroup = {
  key: string;
  title: string;
  options: PlanPackageModuleOption[];
};

export type PlanPackagePlanRecord = {
  code: PlanPackagePlanCode;
  description: string;
  enabledModuleKeys: string[];
  id: string;
  includedUsers: number;
  monthlyPrice: number;
  name: PlanPackagePlanName;
  productKeys: MainProductKey[];
  status: PlanPackageStatus;
  yearlyPrice: number;
};

export type PlanPackagePlanFormValues = {
  description: string;
  enabledModuleKeys: string[];
  includedUsers: number;
  monthlyPrice: number;
  status: PlanPackageStatus;
  yearlyPrice: number;
};

export type PlanPackagePlanFormErrors = Partial<
  Record<keyof PlanPackagePlanFormValues, string>
>;

export type PlanPackageAddOnPricingRecord = {
  code: PlanPackageAddOnCode;
  description: string;
  id: string;
  isActive: boolean;
  monthlyPrice: number;
  name: string;
  unitLabel: string;
  yearlyPrice: number;
};

export type PlanPackagePricingFormErrors = Partial<
  Record<PlanPackageAddOnCode, string>
>;

export type PlanPackageBillingPreviewValues = {
  branches: number;
  companies: number;
  satellites: number;
  users: number;
};

export type PlanPackageBillingPreviewResult = {
  addOnTotal: number;
  basePrice: number;
  lineItems: {
    label: string;
    quantity: number;
    total: number;
    unitPrice: number;
  }[];
  total: number;
};

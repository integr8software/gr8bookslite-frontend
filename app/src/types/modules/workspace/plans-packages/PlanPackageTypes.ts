import type { MainProductKey } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";

export type PlanPackagePlanCode =
  | "ACCOUNTING"
  | "INVENTORY"
  | "ACCOUNTING_INVENTORY";

export type PlanPackageStatus = "Active" | "Draft" | "Archived";

export type PlanPackageAddOnCode =
  | "ADDITIONAL_COMPANY"
  | "ADDITIONAL_BRANCH"
  | "ADDITIONAL_SATELLITE"
  | "ADDITIONAL_USER";

export type PlanPackageDiscountType = "Promo" | "Coupon" | "Voucher";

export type PlanPackageDiscountKind = "Percent" | "Fixed";

export type PlanPackagePlanName =
  | "Accounting"
  | "Inventory"
  | "Accounting + Inventory";

export type PlanPackageDiscountTarget =
  | "All Plans"
  | PlanPackagePlanName
  | "Add-ons";

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

export type PlanPackageDiscountRecord = {
  code: string;
  discountKind: PlanPackageDiscountKind;
  expiresAt: string;
  id: string;
  name: string;
  status: PlanPackageStatus;
  target: PlanPackageDiscountTarget;
  type: PlanPackageDiscountType;
  value: number;
};

export type PlanPackageDiscountFormValues = {
  code: string;
  discountKind: PlanPackageDiscountKind;
  expiresAt: string;
  name: string;
  status: PlanPackageStatus;
  target: PlanPackageDiscountTarget;
  type: PlanPackageDiscountType;
  value: number;
};

export type PlanPackageDiscountFormErrors = Partial<
  Record<keyof PlanPackageDiscountFormValues, string>
>;

export type PlanPackageBillingPreviewValues = {
  branches: number;
  companies: number;
  discountId: string;
  satellites: number;
  users: number;
};

export type PlanPackageBillingPreviewResult = {
  addOnTotal: number;
  basePrice: number;
  discountAmount: number;
  lineItems: {
    label: string;
    quantity: number;
    total: number;
    unitPrice: number;
  }[];
  total: number;
};

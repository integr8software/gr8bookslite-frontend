import type { BranchManagementFormValues } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";

export type BranchActionMode = "add" | "edit" | "view";

export type BranchFormErrors = Partial<
  Record<keyof BranchManagementFormValues, string>
>;

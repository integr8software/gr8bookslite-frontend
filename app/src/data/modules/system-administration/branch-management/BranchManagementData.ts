import type { MainBranch } from "@/app/src/data/modules/shared/MainLayout/ModuleShellTypes";

export type BranchManagementClassification = "branch" | "satellite";

export type BranchManagementFormValues = {
  companyCode: string;
  classification: BranchManagementClassification;
  name: string;
  contactNo: string;
  email: string;
  description: string;
  tin: string;
  linkedMainBranchId: string;
  address: string;
  isMain: boolean;
};

export const BranchManagementInitialFormValues: BranchManagementFormValues = {
  companyCode: "",
  classification: "branch",
  name: "",
  contactNo: "",
  email: "",
  description: "",
  tin: "",
  linkedMainBranchId: "",
  address: "",
  isMain: false,
};

export function createBranchFromForm(
  values: BranchManagementFormValues,
  mainBranch?: MainBranch,
): MainBranch {
  const normalizedName = values.name.trim();
  const code = createBranchCode(values.companyCode, normalizedName);
  const tin =
    values.classification === "satellite"
      ? (mainBranch?.tin ?? values.tin).trim()
      : values.tin.trim();

  return {
    id: `branch-${Date.now()}`,
    code,
    companyCode: values.companyCode.trim().toUpperCase(),
    name: normalizedName,
    contactNo: optionalTrim(values.contactNo),
    email: optionalTrim(values.email),
    description: optionalTrim(values.description),
    tin,
    linkedMainBranchId:
      values.classification === "satellite"
        ? values.linkedMainBranchId
        : undefined,
    address: optionalTrim(values.address),
    href: "/dashboard",
    kind: values.classification,
    isMain: values.classification === "branch" ? values.isMain : false,
    access: { view: true, edit: true },
  };
}

export function updateBranchFromForm(
  branch: MainBranch,
  values: BranchManagementFormValues,
  mainBranch?: MainBranch,
): MainBranch {
  const nextBranch = createBranchFromForm(values, mainBranch);

  return {
    ...nextBranch,
    id: branch.id,
    href: branch.href,
    access: branch.access,
  };
}

export function createBranchFormValues(
  branch: MainBranch,
): BranchManagementFormValues {
  const classification = branch.kind ?? "branch";

  return {
    companyCode: branch.companyCode,
    classification,
    name: branch.name,
    contactNo: branch.contactNo ?? "",
    email: branch.email ?? "",
    description: branch.description ?? "",
    tin: classification === "satellite" ? "" : branch.tin,
    linkedMainBranchId: branch.linkedMainBranchId ?? "",
    address: branch.address ?? "",
    isMain: Boolean(branch.isMain),
  };
}

export function getMainBranchTinOptions(branches: MainBranch[]) {
  return branches.filter(
    (branch) => (branch.kind ?? "branch") === "branch" && Boolean(branch.tin),
  );
}

function createBranchCode(companyCode: string, name: string) {
  const companyPrefix = companyCode.trim().toUpperCase();
  const namePrefix = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return [companyPrefix, namePrefix].filter(Boolean).join("-");
}

function optionalTrim(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || undefined;
}

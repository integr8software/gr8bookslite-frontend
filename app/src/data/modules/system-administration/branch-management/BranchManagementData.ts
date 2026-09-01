import type { MainBranch } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import type {
  WorkspaceCompanyRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { cleanOptional } from "@/app/src/utils/string.util";

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
  const resolvedCompanyCode = resolveCompanyCode(values, mainBranch, normalizedName);
  const code = createBranchCode(resolvedCompanyCode, normalizedName);
  const tin =
    values.classification === "satellite"
      ? (mainBranch?.tin ?? "").trim()
      : values.tin.trim();

  return {
    id: `branch-${Date.now()}`,
    code,
    companyCode: resolvedCompanyCode,
    name: normalizedName,
    contactNo: cleanOptional(values.contactNo),
    email: cleanOptional(values.email),
    description: cleanOptional(values.description),
    tin,
    linkedMainBranchId:
      values.classification === "satellite"
        ? values.linkedMainBranchId
        : undefined,
    address: cleanOptional(values.address),
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

export function mapWorkspaceCompaniesToBranchManagementBranches(
  companies: WorkspaceCompanyRecord[],
): MainBranch[] {
  return companies.flatMap((company) =>
    (company.branches ?? [])
      .filter((branch) => branch.status === "Active")
      .map((branch) => ({
        access: { edit: true, view: true },
        address: branch.address,
        code: branch.code,
        companyCode: company.initials,
        contactNo: branch.contactNumber,
        email: branch.email,
        href: "/dashboard",
        id: branch.id,
        isMain: branch.isMain,
        kind: branch.branchType === "Satellite" ? "satellite" : "branch",
        linkedMainBranchId: branch.linkedMainBranchId,
        name: branch.name,
        tin: branch.tin,
      })),
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

function resolveCompanyCode(
  values: BranchManagementFormValues,
  mainBranch: MainBranch | undefined,
  normalizedName: string,
) {
  const manualCompanyCode = values.companyCode.trim().toUpperCase();

  if (manualCompanyCode) {
    return manualCompanyCode;
  }

  const inheritedCompanyCode = mainBranch?.companyCode?.trim().toUpperCase();

  if (inheritedCompanyCode) {
    return inheritedCompanyCode;
  }

  const generatedCompanyCode = normalizedName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, "").charAt(0))
    .filter(Boolean)
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return generatedCompanyCode || "AUTO";
}


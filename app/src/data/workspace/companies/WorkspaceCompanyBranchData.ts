import { BranchManagementInitialFormValues } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementData";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type {
  CreateWorkspaceCompanyUnitRequest,
  UpdateWorkspaceCompanyUnitRequest,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyUnitApi";
import type { WorkspaceCompanyBranchFormValues } from "@/app/src/types/workspace/WorkspaceCompanyBranchTypes";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { cleanOptional } from "@/app/src/utils/string.util";

export const WorkspaceCompanyBranchFormId = "workspace-company-branch-form";

export function createWorkspaceCompanyBranchFormValues(
  company: WorkspaceCompanyRecord,
): WorkspaceCompanyBranchFormValues {
  return {
    ...BranchManagementInitialFormValues,
    address: "",
    companyCode: company.initials,
    contactNo: "",
    email: "",
    tin: "",
  };
}

export function createWorkspaceCompanyBranchFormValuesFromRecord(
  branch: WorkspaceCompanyBranchRecord,
  company: WorkspaceCompanyRecord,
): WorkspaceCompanyBranchFormValues {
  return {
    ...createWorkspaceCompanyBranchFormValues(company),
    address: branch.address,
    classification: branch.branchType === "Satellite" ? "satellite" : "branch",
    contactNo: branch.contactNumber,
    email: branch.email,
    isMain: branch.isMain,
    linkedMainBranchId: branch.linkedMainBranchId ?? "",
    name: branch.name,
    tin: branch.tin,
  };
}

export function getWorkspaceCompanyMainBranchOptions(
  branches: WorkspaceCompanyBranchRecord[],
): MainBranch[] {
  return branches
    .filter(
      (branch) =>
        (branch.branchType === "Head Office" ||
          branch.branchType === "Branch") &&
        Boolean(branch.tin),
    )
    .map((branch) => ({
      access: { edit: true, view: true },
      address: branch.address,
      code: branch.code,
      companyCode: branch.companyId,
      contactNo: branch.contactNumber,
      email: branch.email,
      href: "/dashboard",
      id: branch.id,
      isMain: branch.isMain,
      kind: "branch",
      name: branch.name,
      tin: branch.tin,
    }));
}

export function getWorkspaceCompanyHeadOfficeBranch(
  branches: WorkspaceCompanyBranchRecord[],
) {
  return (
    branches.find((branch) => branch.isMain && Boolean(branch.tin)) ??
    branches.find(
      (branch) =>
        (branch.branchType === "Head Office" ||
          branch.branchType === "Branch") &&
        Boolean(branch.tin),
    )
  );
}

export function createWorkspaceCompanyUnitPayload(
  values: WorkspaceCompanyBranchFormValues,
  headOfficeBranch?: WorkspaceCompanyBranchRecord,
): CreateWorkspaceCompanyUnitRequest {
  const isSatellite = values.classification === "satellite";
  const linkedMainBranchId = values.linkedMainBranchId || headOfficeBranch?.id;
  const parentUnitId = Number(linkedMainBranchId);

  return {
    address: cleanOptional(values.address),
    code: createWorkspaceCompanyUnitCode(values.companyCode, values.name),
    contactNumber: cleanOptional(values.contactNo),
    email: cleanOptional(values.email)?.toLowerCase(),
    name: values.name.trim(),
    parentUnitId:
      isSatellite && Number.isFinite(parentUnitId) ? parentUnitId : undefined,
    tin: isSatellite ? undefined : values.tin.trim(),
    type: isSatellite ? "SATELLITE" : "BRANCH",
  };
}

export function createWorkspaceCompanyUnitUpdatePayload(
  values: WorkspaceCompanyBranchFormValues,
  headOfficeBranch?: WorkspaceCompanyBranchRecord,
): UpdateWorkspaceCompanyUnitRequest {
  const isSatellite = values.classification === "satellite";
  const linkedMainBranchId = values.linkedMainBranchId || headOfficeBranch?.id;
  const parentUnitId = Number(linkedMainBranchId);

  return {
    address: cleanOptional(values.address),
    code: createWorkspaceCompanyUnitCode(values.companyCode, values.name),
    contactNumber: cleanOptional(values.contactNo),
    email: cleanOptional(values.email)?.toLowerCase(),
    name: values.name.trim(),
    parentUnitId:
      isSatellite && Number.isFinite(parentUnitId) ? parentUnitId : undefined,
    tin: isSatellite ? undefined : values.tin.trim(),
  };
}

function createWorkspaceCompanyUnitCode(
  companyCode: string,
  branchName: string,
) {
  const companyPrefix = companyCode.trim().toUpperCase();
  const branchPrefix = branchName
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, "").charAt(0))
    .filter(Boolean)
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return [companyPrefix, branchPrefix].filter(Boolean).join("-") || undefined;
}


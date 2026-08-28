import {
  workspaceUsersControllerCancelInvitationV1,
  workspaceUsersControllerCreateV1,
  workspaceUsersControllerFindAllV1,
  workspaceUsersControllerResendInvitationV1,
  workspaceUsersControllerUpdateV1,
} from "@/app/src/generated/api/workspace-users/workspace-users";
import type {
  CreateWorkspaceUserDto,
  WorkspaceUserCancelInvitationResponseDto,
  WorkspaceUserMessageResponseDto,
  WorkspaceUserResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  WorkspaceCompanyBranchRecord,
  WorkspaceCompanyStatus,
  WorkspaceCompanyUnitApiType,
  WorkspaceCompanyUserAssignedUnitApiRecord,
  WorkspaceCompanyUserApiRecord,
  WorkspaceCompanyUserFormValues,
  WorkspaceCompanyUserRecord,
  WorkspaceUserStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

type WorkspaceCompanyUserApiLike =
  | WorkspaceCompanyUserApiRecord
  | WorkspaceUserResponseDto;

const WorkspaceUserMutationTimeoutMs = 60000;

export async function GetWorkspaceUsers() {
  const response = await workspaceUsersControllerFindAllV1();

  return response.map(MapWorkspaceUserApiRecord);
}

export async function CreateWorkspaceUser(
  values: WorkspaceCompanyUserFormValues,
) {
  const response = await workspaceUsersControllerCreateV1(
    MapWorkspaceUserFormToRequest(values),
    {
      timeout: WorkspaceUserMutationTimeoutMs,
    },
  );

  return MapWorkspaceUserApiRecord(response);
}

export async function UpdateWorkspaceUser(
  userId: string,
  values: WorkspaceCompanyUserFormValues,
) {
  const response = await workspaceUsersControllerUpdateV1(
    Number(userId),
    MapWorkspaceUserFormToRequest(values),
    {
      timeout: WorkspaceUserMutationTimeoutMs,
    },
  );

  return MapWorkspaceUserApiRecord(response);
}

export async function ResendWorkspaceUserInvitation(userId: string) {
  return workspaceUsersControllerResendInvitationV1(
    Number(userId),
  ) as Promise<WorkspaceUserMessageResponseDto>;
}

export async function CancelWorkspaceUserInvitation(userId: string) {
  return workspaceUsersControllerCancelInvitationV1(
    Number(userId),
  ) as Promise<WorkspaceUserCancelInvitationResponseDto>;
}

function MapWorkspaceUserFormToRequest(
  values: WorkspaceCompanyUserFormValues,
): CreateWorkspaceUserDto {
  const contactNumber = values.contactNumber.trim();

  return {
    companyAssignments: values.companyAssignments.map((assignment) => ({
      companyId: Number(assignment.companyId),
      unitIds: assignment.branchIds.map(Number),
      role: assignment.role ?? "USER",
      companyRoleId: assignment.companyRoleId ? Number(assignment.companyRoleId) : null,
    })),
    contactNumber:
      contactNumber && contactNumber !== "+63" ? contactNumber : undefined,
    email: values.email.trim().toLowerCase(),
    name: values.name.trim(),
  };
}

export function MapWorkspaceUserApiRecord(
  user: WorkspaceCompanyUserApiLike,
): WorkspaceCompanyUserRecord {
  const primaryCompanyId = user.companyAssignments[0]?.companyId;

  return {
    companyAssignments: user.companyAssignments.map((assignment) => ({
      branchIds: assignment.unitIds.map(String),
      branches: assignment.units?.map(MapWorkspaceUserAssignedUnitApiRecord),
      companyId: String(assignment.companyId),
      role: (assignment as any).role ?? "USER",
      companyRoleId: (assignment as any).companyRoleId
        ? String((assignment as any).companyRoleId)
        : null,
    })),
    companyId: primaryCompanyId ? String(primaryCompanyId) : "",


    contactNumber: user.contactNumber ?? "",
    email: user.email,
    id: String(user.id),
    createdAt: FormatDate(user.createdAt),
    lastLogin: user.lastLogin
      ? FormatDateTime(user.lastLogin)
      : "Not yet signed in",
    name: user.name,
    profileImageUrl: user.profileImageUrl ?? undefined,
    status: GetWorkspaceUserStatus(user.status),
  };
}

function MapWorkspaceUserAssignedUnitApiRecord(
  unit: WorkspaceCompanyUserAssignedUnitApiRecord,
): WorkspaceCompanyBranchRecord {
  return {
    address: "",
    branchType: GetWorkspaceCompanyBranchType(unit.type),
    code: "",
    companyId: String(unit.companyId),
    contactNumber: "",
    email: "",
    id: String(unit.id),
    isMain: unit.type === "HEAD_OFFICE",
    name: unit.displayName ?? unit.name,
    status: GetWorkspaceCompanyUnitStatus(unit.isActive),
    tin: "",
  };
}

function GetWorkspaceCompanyBranchType(
  type: WorkspaceCompanyUnitApiType,
): WorkspaceCompanyBranchRecord["branchType"] {
  if (type === "HEAD_OFFICE") {
    return "Head Office";
  }

  return type === "SATELLITE" ? "Satellite" : "Branch";
}

function GetWorkspaceCompanyUnitStatus(
  isActive: boolean,
): WorkspaceCompanyStatus {
  return isActive ? "Active" : "Inactive";
}

function GetWorkspaceUserStatus(
  status: WorkspaceCompanyUserApiLike["status"],
): WorkspaceUserStatus {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "SUSPENDED") {
    return "Suspended";
  }

  return "Pending";
}

function FormatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function FormatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    hour12: true,
    year: "numeric",
  }).format(new Date(value));
}

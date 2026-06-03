import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  WorkspaceCompanyUserApiRecord,
  WorkspaceCompanyUserApiRequest,
  WorkspaceCompanyUserCancelInvitationResponse,
  WorkspaceCompanyUserResendInvitationResponse,
  WorkspaceCompanyUserFormValues,
  WorkspaceCompanyUserRecord,
  WorkspaceCompanyStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export async function GetWorkspaceUsers() {
  const response = await ApiClient.get<WorkspaceCompanyUserApiRecord[]>(
    "/workspace/users",
  );

  return response.data.map(MapWorkspaceUserApiRecord);
}

export async function CreateWorkspaceUser(
  values: WorkspaceCompanyUserFormValues,
) {
  const response = await ApiClient.post<WorkspaceCompanyUserApiRecord>(
    "/workspace/users",
    MapWorkspaceUserFormToRequest(values),
  );

  return MapWorkspaceUserApiRecord(response.data);
}

export async function UpdateWorkspaceUser(
  userId: string,
  values: WorkspaceCompanyUserFormValues,
) {
  const response = await ApiClient.patch<WorkspaceCompanyUserApiRecord>(
    `/workspace/users/${userId}`,
    MapWorkspaceUserFormToRequest(values),
  );

  return MapWorkspaceUserApiRecord(response.data);
}

export async function ResendWorkspaceUserInvitation(userId: string) {
  const response =
    await ApiClient.post<WorkspaceCompanyUserResendInvitationResponse>(
      `/workspace/users/${userId}/resend-invitation`,
    );

  return response.data;
}

export async function CancelWorkspaceUserInvitation(userId: string) {
  const response =
    await ApiClient.delete<WorkspaceCompanyUserCancelInvitationResponse>(
      `/workspace/users/${userId}/invitation`,
    );

  return response.data;
}

function MapWorkspaceUserFormToRequest(
  values: WorkspaceCompanyUserFormValues,
): WorkspaceCompanyUserApiRequest {
  const contactNumber = values.contactNumber.trim();

  return {
    companyAssignments: values.companyAssignments.map((assignment) => ({
      companyId: Number(assignment.companyId),
      unitIds: assignment.branchIds.map(Number),
    })),
    contactNumber:
      contactNumber && contactNumber !== "+63" ? contactNumber : undefined,
    email: values.email.trim().toLowerCase(),
    name: values.name.trim(),
  };
}

function MapWorkspaceUserApiRecord(
  user: WorkspaceCompanyUserApiRecord,
): WorkspaceCompanyUserRecord {
  const primaryCompanyId = user.companyAssignments[0]?.companyId;

  return {
    companyAssignments: user.companyAssignments.map((assignment) => ({
      branchIds: assignment.unitIds.map(String),
      companyId: String(assignment.companyId),
    })),
    companyId: primaryCompanyId ? String(primaryCompanyId) : "",
    contactNumber: user.contactNumber ?? "",
    email: user.email,
    id: String(user.id),
    lastLogin: user.lastLogin
      ? FormatDate(user.lastLogin)
      : "Not yet signed in",
    name: user.name,
    profileImageUrl: user.profileImageUrl ?? undefined,
    status: GetWorkspaceUserStatus(user.status),
  };
}

function GetWorkspaceUserStatus(
  status: WorkspaceCompanyUserApiRecord["status"],
): WorkspaceCompanyStatus {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "SUSPENDED") {
    return "Inactive";
  }

  return "Pending";
}

function FormatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    hour12: true,
    year: "numeric",
  }).format(new Date(value));
}

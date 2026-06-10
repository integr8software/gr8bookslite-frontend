import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	BranchUserApiResponse,
	BranchUserRoleApiResponse,
} from "@/app/src/types/modules/user-management/UserListTypes";
import type {
	UserManagementRecord,
	UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export async function GetBranchUsers(unitId: string) {
	const response = await ApiClient.get<BranchUserApiResponse>(
		`/company/units/${unitId}/users`,
	);

	return response.data.users.map(MapBranchUserApiRecord);
}

export async function GetBranchUserRoles(unitId: string) {
	const response = await ApiClient.get<{ roles: BranchUserRoleApiResponse[] }>(
		`/company/units/${unitId}/users/roles`,
	);

	return response.data.roles.map(MapBranchUserRoleApiRecord);
}

export async function UpdateBranchUserRole(
	unitId: string,
	userId: string,
	companyRoleId: string,
) {
	const response = await ApiClient.patch<BranchUserApiResponse["users"][number]>(
		`/company/units/${unitId}/users/${userId}/role`,
		{
			companyRoleId: companyRoleId ? Number(companyRoleId) : null,
		},
	);

	return MapBranchUserApiRecord(response.data);
}

function MapBranchUserApiRecord(
	user: BranchUserApiResponse["users"][number],
): UserManagementRecord {
	return {
		contactNumber: user.contactNumber ?? "",
		email: user.email,
		id: String(user.id),
		lastLogin: user.lastAccessedAt ? FormatDate(user.lastAccessedAt) : undefined,
		name: user.name,
		profileImageUrl: user.profileImageUrl ?? undefined,
		status: MapUserStatus(user.status),
		userRoleId: user.companyRole ? String(user.companyRole.id) : "",
	};
}

function MapBranchUserRoleApiRecord(
	role: BranchUserRoleApiResponse,
): UserRoleRecord {
	return {
		accessRoles: role.permissions.flatMap((permission) =>
			MapPermissionActions(permission).map(
				(action) => `${permission.permissionCode}.${action}`,
			),
		),
		description: role.description ?? "",
		id: String(role.id),
		name: role.name,
		status: role.isActive === false ? "Inactive" : "Active",
	};
}

function MapPermissionActions(
	permission: BranchUserRoleApiResponse["permissions"][number],
) {
	return permission.actions?.length
		? permission.actions
		: [
				permission.canView ? "view" : null,
				permission.canCreate ? "create" : null,
				permission.canUpdate ? "update" : null,
				permission.canCancel || permission.canDelete ? "cancel" : null,
				permission.canUncancel ? "uncancel" : null,
				permission.canExport ? "export" : null,
			].filter((action): action is string => Boolean(action));
}

function MapUserStatus(status: string): UserManagementRecord["status"] {
	if (status === "ACTIVE") {
		return "Active";
	}

	if (status === "PENDING_VERIFICATION") {
		return "Pending";
	}

	return "Inactive";
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

import {
	UserAccessRoleOptions,
	type UserRoleFormValues,
	type UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { BranchUserRoleApiResponse } from "@/app/src/types/modules/user-management/UserListTypes";

type BranchRolePermissionPayload = {
	moduleCode: string;
	moduleName: string;
	permissionCode: string;
	permissionName: string;
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	canApprove: boolean;
	canExport: boolean;
};

type BranchRolePayload = {
	name: string;
	description: string | null;
	permissions: BranchRolePermissionPayload[];
};

function GetAuthorizationHeaders(accessToken: string | null) {
	if (!accessToken) {
		return undefined;
	}

	return {
		Authorization: `Bearer ${accessToken}`,
	};
}

export async function GetBranchRoles(
	accessToken: string | null,
	unitId: string,
) {
	const response = await ApiClient.get<{ roles: BranchUserRoleApiResponse[] }>(
		`/company/units/${unitId}/roles`,
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return response.data.roles.map(MapBranchRoleApiRecord);
}

export async function GetBranchRole(
	accessToken: string | null,
	unitId: string,
	roleId: string,
) {
	const response = await ApiClient.get<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles/${roleId}`,
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return MapBranchRoleApiRecord(response.data.role);
}

export async function CreateBranchRole(
	accessToken: string | null,
	unitId: string,
	values: UserRoleFormValues,
) {
	const response = await ApiClient.post<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles`,
		MapUserRoleFormValuesToPayload(values),
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return MapBranchRoleApiRecord(response.data.role);
}

export async function UpdateBranchRole(
	accessToken: string | null,
	unitId: string,
	roleId: string,
	values: UserRoleFormValues,
) {
	const response = await ApiClient.patch<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles/${roleId}`,
		MapUserRoleFormValuesToPayload(values),
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return MapBranchRoleApiRecord(response.data.role);
}

export async function UpdateBranchRoleStatus(
	accessToken: string | null,
	unitId: string,
	roleId: string,
	isActive: boolean,
) {
	const response = await ApiClient.patch<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles/${roleId}/status`,
		{ isActive },
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return MapBranchRoleApiRecord(response.data.role);
}

function MapBranchRoleApiRecord(role: BranchUserRoleApiResponse): UserRoleRecord {
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
	return [
		permission.canView ? "read" : null,
		permission.canCreate ? "create" : null,
		permission.canUpdate ? "update" : null,
		permission.canDelete ? "delete" : null,
		permission.canApprove ? "approve" : null,
		permission.canExport ? "print-export" : null,
	].filter((action): action is string => Boolean(action));
}

function MapUserRoleFormValuesToPayload(
	values: UserRoleFormValues,
): BranchRolePayload {
	return {
		name: values.name,
		description: values.description.trim() || null,
		permissions: BuildPermissionPayload(values.accessRoles),
	};
}

function BuildPermissionPayload(accessRoles: string[]) {
	const selectedAccessRoles = new Set(accessRoles);

	return UserAccessRoleOptions.flatMap((accessModule) =>
		accessModule.children.flatMap((submodule) => {
			const canView = selectedAccessRoles.has(`${submodule.value}.read`);
			const canCreate = selectedAccessRoles.has(`${submodule.value}.create`);
			const canUpdate = selectedAccessRoles.has(`${submodule.value}.update`);
			const canDelete = selectedAccessRoles.has(`${submodule.value}.delete`);
			const canApprove = selectedAccessRoles.has(`${submodule.value}.approve`);
			const canExport = selectedAccessRoles.has(
				`${submodule.value}.print-export`,
			);

			if (
				!canView &&
				!canCreate &&
				!canUpdate &&
				!canDelete &&
				!canApprove &&
				!canExport
			) {
				return [];
			}

			return [
				{
					moduleCode: accessModule.value,
					moduleName: accessModule.label,
					permissionCode: submodule.value,
					permissionName: submodule.label,
					canView,
					canCreate,
					canUpdate,
					canDelete,
					canApprove,
					canExport,
				},
			];
		}),
	);
}

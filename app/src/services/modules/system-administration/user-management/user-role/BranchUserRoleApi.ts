import {
	type UserAccessRoleOption,
	type UserRoleFormValues,
	type UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	BranchPermissionCatalogApiResponse,
	BranchUserRoleApiResponse,
} from "@/app/src/types/modules/user-management/UserListTypes";

type BranchRolePermissionPayload = {
	permissionCode: string;
	actions: string[];
};

type BranchRolePayload = {
	name: string;
	description: string | null;
	permissions: BranchRolePermissionPayload[];
};

const BranchRoleWriteTimeoutMs = 60000;

export async function GetBranchRoles(unitId: string) {
	const response = await ApiClient.get<{ roles: BranchUserRoleApiResponse[] }>(
		`/company/units/${unitId}/roles`,
	);

	return response.data.roles.map(MapBranchRoleApiRecord);
}

export async function GetBranchPermissionCatalog(unitId: string) {
	const response = await ApiClient.get<BranchPermissionCatalogApiResponse>(
		`/company/units/${unitId}/roles/permission-catalog`,
	);

	return response.data.modules.map((module): UserAccessRoleOption => ({
		value: module.code,
		label: module.name,
		children: module.submodules.map((submodule) => ({
			permissionCode: submodule.permissionCode,
			label: submodule.name,
			actions: submodule.actions,
		})),
	}));
}

export async function GetBranchRole(
	unitId: string,
	roleId: string,
) {
	const response = await ApiClient.get<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles/${roleId}`,
	);

	return MapBranchRoleApiRecord(response.data.role);
}

export async function CreateBranchRole(
	unitId: string,
	values: UserRoleFormValues,
	permissionCatalog: UserAccessRoleOption[],
) {
	const response = await ApiClient.post<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles`,
		MapUserRoleFormValuesToPayload(values, permissionCatalog),
		{ timeout: BranchRoleWriteTimeoutMs },
	);

	return MapBranchRoleApiRecord(response.data.role);
}

export async function UpdateBranchRole(
	unitId: string,
	roleId: string,
	values: UserRoleFormValues,
	permissionCatalog: UserAccessRoleOption[],
) {
	const response = await ApiClient.patch<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles/${roleId}`,
		MapUserRoleFormValuesToPayload(values, permissionCatalog),
		{ timeout: BranchRoleWriteTimeoutMs },
	);

	return MapBranchRoleApiRecord(response.data.role);
}

export async function UpdateBranchRoleStatus(
	unitId: string,
	roleId: string,
	isActive: boolean,
) {
	const response = await ApiClient.patch<{ role: BranchUserRoleApiResponse }>(
		`/company/units/${unitId}/roles/${roleId}/status`,
		{ isActive },
		{ timeout: BranchRoleWriteTimeoutMs },
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
	return permission.actions?.length
		? permission.actions
		: [
				permission.canView ? "view" : null,
				permission.canCreate ? "create" : null,
				permission.canUpdate ? "update" : null,
				permission.canCancel ? "cancel" : null,
				permission.canUncancel ? "uncancel" : null,
				permission.canExport ? "export" : null,
			].filter((action): action is string => Boolean(action));
}

function MapUserRoleFormValuesToPayload(
	values: UserRoleFormValues,
	permissionCatalog: UserAccessRoleOption[],
): BranchRolePayload {
	return {
		name: values.name,
		description: values.description.trim() || null,
		permissions: BuildPermissionPayload(values.accessRoles, permissionCatalog),
	};
}

function BuildPermissionPayload(
	accessRoles: string[],
	permissionCatalog: UserAccessRoleOption[],
) {
	const selectedAccessRoles = new Set(accessRoles);

	return permissionCatalog.flatMap((accessModule) =>
		accessModule.children.flatMap((submodule) => {
			const actions = (submodule.actions ?? [
				"view",
				"create",
				"update",
				"cancel",
				"uncancel",
				"export",
			])
				.filter((action) =>
					selectedAccessRoles.has(`${submodule.permissionCode}.${action}`),
				);

			if (actions.length === 0) {
				return [];
			}

			return [
				{
					permissionCode: submodule.permissionCode,
					actions,
				},
			];
		}),
	);
}

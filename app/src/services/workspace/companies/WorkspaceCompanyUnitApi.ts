import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

type WorkspaceCompanyUnitApiType = "BRANCH" | "HEAD_OFFICE" | "SATELLITE";

type WorkspaceCompanyUnitApiRecord = {
	id: number;
	companyId: number;
	parentUnitId: number | null;
	type: WorkspaceCompanyUnitApiType;
	code: string | null;
	name: string;
	displayName: string | null;
	tin: string | null;
	address: string | null;
	contactNumber: string | null;
	email: string | null;
	isActive: boolean;
};

export type CreateWorkspaceCompanyUnitRequest = {
	type: Exclude<WorkspaceCompanyUnitApiType, "HEAD_OFFICE">;
	name: string;
	code?: string;
	tin?: string;
	address?: string;
	contactNumber?: string;
	email?: string;
	parentUnitId?: number;
};

export type UpdateWorkspaceCompanyUnitRequest =
	Partial<CreateWorkspaceCompanyUnitRequest>;

function getAuthorizationHeaders(accessToken: string | null) {
	if (!accessToken) {
		return undefined;
	}

	return {
		Authorization: `Bearer ${accessToken}`,
	};
}

export async function getWorkspaceCompanyUnits(
	accessToken: string | null,
	companyId: string,
) {
	const response = await ApiClient.get<WorkspaceCompanyUnitApiRecord[]>(
		`/workspace/companies/${companyId}/units`,
		{
			headers: getAuthorizationHeaders(accessToken),
		},
	);

	return response.data.map(mapWorkspaceCompanyUnit);
}

export async function createWorkspaceCompanyUnit(
	accessToken: string | null,
	companyId: string,
	payload: CreateWorkspaceCompanyUnitRequest,
) {
	const response = await ApiClient.post<WorkspaceCompanyUnitApiRecord>(
		`/workspace/companies/${companyId}/units`,
		payload,
		{
			headers: getAuthorizationHeaders(accessToken),
		},
	);

	return mapWorkspaceCompanyUnit(response.data);
}

export async function updateWorkspaceCompanyUnit(
	accessToken: string | null,
	companyId: string,
	unitId: string,
	payload: UpdateWorkspaceCompanyUnitRequest,
) {
	const response = await ApiClient.patch<WorkspaceCompanyUnitApiRecord>(
		`/workspace/companies/${companyId}/units/${unitId}`,
		payload,
		{
			headers: getAuthorizationHeaders(accessToken),
		},
	);

	return mapWorkspaceCompanyUnit(response.data);
}

export async function deactivateWorkspaceCompanyUnit(
	accessToken: string | null,
	companyId: string,
	unitId: string,
) {
	const response = await ApiClient.delete<WorkspaceCompanyUnitApiRecord>(
		`/workspace/companies/${companyId}/units/${unitId}`,
		{
			headers: getAuthorizationHeaders(accessToken),
		},
	);

	return mapWorkspaceCompanyUnit(response.data);
}

function mapWorkspaceCompanyUnit(
	unit: WorkspaceCompanyUnitApiRecord,
): WorkspaceCompanyBranchRecord {
	const isSatellite = unit.type === "SATELLITE";
	const status: WorkspaceCompanyStatus = unit.isActive ? "Active" : "Inactive";

	return {
		address: unit.address ?? "",
		branchType: isSatellite ? "Satellite" : "Branch",
		code: unit.code ?? `UNIT-${unit.id}`,
		companyId: String(unit.companyId),
		contactNumber: unit.contactNumber ?? "",
		email: unit.email ?? "",
		id: String(unit.id),
		isMain: unit.type === "HEAD_OFFICE",
		linkedMainBranchId: unit.parentUnitId
			? String(unit.parentUnitId)
			: undefined,
		name: unit.displayName ?? unit.name,
		status,
		tin: unit.tin ?? "",
	};
}

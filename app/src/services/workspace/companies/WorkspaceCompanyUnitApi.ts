import {
	workspaceCompaniesControllerCreateUnitV1,
	workspaceCompaniesControllerDeactivateUnitV1,
	workspaceCompaniesControllerFindUnitsV1,
	workspaceCompaniesControllerUpdateUnitV1,
} from "@/app/src/generated/api/workspace-companies/workspace-companies";
import type { WorkspaceCompanyUnitResponseDto } from "@/app/src/generated/api/gR8BooksLiteAPI.schemas";
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

type WorkspaceCompanyUnitApiLike =
	| WorkspaceCompanyUnitApiRecord
	| WorkspaceCompanyUnitResponseDto;

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

export async function getWorkspaceCompanyUnits(companyId: string) {
	const response = await workspaceCompaniesControllerFindUnitsV1(
		Number(companyId),
	);

	return response.map(mapWorkspaceCompanyUnit);
}

export async function createWorkspaceCompanyUnit(
	companyId: string,
	payload: CreateWorkspaceCompanyUnitRequest,
) {
	const response = await workspaceCompaniesControllerCreateUnitV1(
		Number(companyId),
		payload,
	);

	return mapWorkspaceCompanyUnit(response);
}

export async function updateWorkspaceCompanyUnit(
	companyId: string,
	unitId: string,
	payload: UpdateWorkspaceCompanyUnitRequest,
) {
	void companyId;
	const response = await workspaceCompaniesControllerUpdateUnitV1(
		Number(unitId),
		payload,
	);

	return mapWorkspaceCompanyUnit(response);
}

export async function deactivateWorkspaceCompanyUnit(
	companyId: string,
	unitId: string,
) {
	void companyId;
	const response = await workspaceCompaniesControllerDeactivateUnitV1(
		Number(unitId),
	);

	return mapWorkspaceCompanyUnit(response);
}

function mapWorkspaceCompanyUnit(
	unit: WorkspaceCompanyUnitApiLike,
): WorkspaceCompanyBranchRecord {
	const isHeadOffice = unit.type === "HEAD_OFFICE";
	const isSatellite = unit.type === "SATELLITE";
	const status: WorkspaceCompanyStatus = unit.isActive ? "Active" : "Inactive";

	return {
		address: unit.address ?? "",
		branchType: isHeadOffice
			? "Head Office"
			: isSatellite
				? "Satellite"
				: "Branch",
		code: unit.code ?? `UNIT-${unit.id}`,
		companyId: String(unit.companyId),
		contactNumber: unit.contactNumber ?? "",
		email: unit.email ?? "",
		id: String(unit.id),
		isMain: isHeadOffice,
		linkedMainBranchId: unit.parentUnitId
			? String(unit.parentUnitId)
			: undefined,
		name: unit.displayName ?? unit.name,
		status,
		tin: unit.tin ?? "",
	};
}

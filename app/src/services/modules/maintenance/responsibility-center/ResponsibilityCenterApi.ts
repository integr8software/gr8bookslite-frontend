import { ResponsibilityCenterApiPath } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiResponsibilityCenter,
	ApiResponsibilityCenterCategory,
	ApiResponsibilityCenterFinancialType,
	ApiResponsibilityCenterListResponse,
	ApiResponsibilityCenterSaveResponse,
	ApiResponsibilityCenterStatus,
	ResponsibilityCenter,
	ResponsibilityCenterCategory,
	ResponsibilityCenterFinancialType,
	ResponsibilityCenterFormValues,
	ResponsibilityCenterListResponse,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

export async function fetchResponsibilityCenters(): Promise<ResponsibilityCenterListResponse> {
	const response = await ApiClient.get<ApiResponsibilityCenterListResponse>(
		ResponsibilityCenterApiPath,
		{
			params: { limit: 500 },
		},
	);

	return {
		centers: response.data.centers.map(mapApiResponsibilityCenter),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function createResponsibilityCenter(
	values: ResponsibilityCenterFormValues | ResponsibilityCenter,
): Promise<ResponsibilityCenter> {
	const response = await ApiClient.post<ApiResponsibilityCenterSaveResponse>(
		ResponsibilityCenterApiPath,
		toApiResponsibilityCenterPayload(values),
	);

	return mapApiResponsibilityCenter(response.data.center);
}

export async function updateResponsibilityCenter(
	center: ResponsibilityCenter,
): Promise<ResponsibilityCenter> {
	const response = await ApiClient.patch<ApiResponsibilityCenterSaveResponse>(
		`${ResponsibilityCenterApiPath}/${center.id}`,
		toApiResponsibilityCenterPayload(center),
	);

	return mapApiResponsibilityCenter(response.data.center);
}

export async function updateResponsibilityCenterStatus(
	center: ResponsibilityCenter,
): Promise<ResponsibilityCenter> {
	const response = await ApiClient.patch<ApiResponsibilityCenterSaveResponse>(
		`${ResponsibilityCenterApiPath}/${center.id}/status`,
		{ status: mapStatusToApi(center.status) },
	);

	return mapApiResponsibilityCenter(response.data.center);
}

function mapApiResponsibilityCenter(
	center: ApiResponsibilityCenter,
): ResponsibilityCenter {
	return {
		id: center.id,
		code: center.code,
		name: center.name,
		category: mapCategoryFromApi(center.category),
		financialType: mapFinancialTypeFromApi(center.financialType),
		manager: center.manager ?? "",
		parentId: center.parentId ?? undefined,
		status: mapStatusFromApi(center.status),
		description: center.description ?? "",
		createdBy: center.createdBy ?? undefined,
		createdAt: center.createdAt,
		updatedBy: center.updatedBy,
		updatedAt: center.updatedAt,
	};
}

function toApiResponsibilityCenterPayload(
	center: ResponsibilityCenterFormValues | ResponsibilityCenter,
) {
	return {
		code: center.code.trim().toUpperCase(),
		name: center.name.trim(),
		category: mapCategoryToApi(center.category),
		financialType: mapFinancialTypeToApi(center.financialType),
		manager: center.manager.trim(),
		parentId: center.parentId?.trim() || undefined,
		status: mapStatusToApi(center.status),
		description: center.description?.trim() ?? "",
	};
}

function mapCategoryFromApi(
	value: ApiResponsibilityCenterCategory,
): ResponsibilityCenterCategory {
	const categories: Record<
		ApiResponsibilityCenterCategory,
		ResponsibilityCenterCategory
	> = {
		CORPORATE: "Corporate",
		DIVISION: "Division",
		DEPARTMENT: "Department",
		SECTION: "Section",
		TEAM: "Team",
		BRANCH: "Branch",
		BUILDING: "Building",
		PROJECT: "Project",
		BUSINESS_UNIT: "Business Unit",
		REGION: "Region",
		SALESMAN: "Salesman",
		WAREHOUSE: "Warehouse",
		OUTLET: "Outlet",
		SALES_TERRITORY: "Sales Territory",
		FLEET: "Fleet",
	};

	return categories[value];
}

function mapCategoryToApi(
	value: ResponsibilityCenterCategory,
): ApiResponsibilityCenterCategory {
	const categories: Record<
		ResponsibilityCenterCategory,
		ApiResponsibilityCenterCategory
	> = {
		Corporate: "CORPORATE",
		Division: "DIVISION",
		Department: "DEPARTMENT",
		Section: "SECTION",
		Team: "TEAM",
		Branch: "BRANCH",
		Building: "BUILDING",
		Project: "PROJECT",
		"Business Unit": "BUSINESS_UNIT",
		Region: "REGION",
		Salesman: "SALESMAN",
		Warehouse: "WAREHOUSE",
		Outlet: "OUTLET",
		"Sales Territory": "SALES_TERRITORY",
		Fleet: "FLEET",
	};

	return categories[value];
}

function mapFinancialTypeFromApi(
	value: ApiResponsibilityCenterFinancialType,
): ResponsibilityCenterFinancialType {
	const financialTypes: Record<
		ApiResponsibilityCenterFinancialType,
		ResponsibilityCenterFinancialType
	> = {
		COST_CENTER: "Cost Center",
		PROFIT_CENTER: "Profit Center",
		REVENUE_CENTER: "Revenue Center",
		INVESTMENT_CENTER: "Investment Center",
	};

	return financialTypes[value];
}

function mapFinancialTypeToApi(
	value: ResponsibilityCenterFinancialType,
): ApiResponsibilityCenterFinancialType {
	const financialTypes: Record<
		ResponsibilityCenterFinancialType,
		ApiResponsibilityCenterFinancialType
	> = {
		"Cost Center": "COST_CENTER",
		"Profit Center": "PROFIT_CENTER",
		"Revenue Center": "REVENUE_CENTER",
		"Investment Center": "INVESTMENT_CENTER",
	};

	return financialTypes[value];
}

function mapStatusFromApi(
	value: ApiResponsibilityCenterStatus,
): ResponsibilityCenterStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(
	value: ResponsibilityCenterStatus,
): ApiResponsibilityCenterStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

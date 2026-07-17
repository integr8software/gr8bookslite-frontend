import { ResponsibilityCenterApiPath } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiResponsibilityCenter,
	ApiResponsibilityCenterCategory,
	ApiResponsibilityCenterClassificationsResponse,
	ApiResponsibilityCenterCodeSuggestionResponse,
	ApiResponsibilityCenterFinancialType,
	ApiResponsibilityCenterListResponse,
	ApiResponsibilityCenterSaveResponse,
	ApiResponsibilityCenterStatus,
	ApiResponsibilityCenterTypesResponse,
	ResponsibilityCenter,
	ResponsibilityCenterCategory,
	ResponsibilityCenterClassification,
	ResponsibilityCenterFinancialType,
	ResponsibilityCenterFormValues,
	ResponsibilityCenterListResponse,
	ResponsibilityCenterStatus,
	ResponsibilityCenterTypeOption,
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

export async function fetchResponsibilityCenterClassifications(): Promise<
	ResponsibilityCenterClassification[]
> {
	const response =
		await ApiClient.get<ApiResponsibilityCenterClassificationsResponse>(
			`${ResponsibilityCenterApiPath}/classifications`,
		);

	return response.data.classifications.map((classification) => ({
		id: classification.id,
		code: classification.code,
		name: mapFinancialTypeFromLabel(classification.name),
		trackingBehavior: classification.trackingBehavior,
		isSystem: classification.isSystem,
		status: classification.status,
	}));
}

export async function fetchResponsibilityCenterTypes(
	classificationId?: string,
): Promise<ResponsibilityCenterTypeOption[]> {
	const response = await ApiClient.get<ApiResponsibilityCenterTypesResponse>(
		`${ResponsibilityCenterApiPath}/types`,
		{ params: classificationId ? { classificationId } : undefined },
	);

	return response.data.types.map((type) => ({
		id: type.id,
		classificationId: type.classificationId,
		classificationCode: type.classificationCode,
		classificationName: mapFinancialTypeFromLabel(type.classificationName),
		name: type.name,
		codePrefix: type.codePrefix,
		description: type.description,
		sortOrder: type.sortOrder,
		isRequired: type.isRequired,
		status: type.status,
	}));
}

export async function fetchResponsibilityCenterCodeSuggestion(
	typeId: string,
): Promise<string> {
	const response =
		await ApiClient.get<ApiResponsibilityCenterCodeSuggestionResponse>(
			`${ResponsibilityCenterApiPath}/code-suggestion`,
			{ params: { typeId } },
		);

	return response.data.code;
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
		classificationId: center.classificationId,
		classificationCode: center.classificationCode,
		classificationName: mapFinancialTypeFromLabel(center.classificationName),
		typeId: center.typeId,
		typeName: center.typeName,
		typeCodePrefix: center.typeCodePrefix,
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
		classificationId: center.classificationId,
		typeId: center.typeId,
		manager: center.manager.trim(),
		parentId: center.parentId?.trim() || undefined,
		status: mapStatusToApi(center.status),
		description: center.description?.trim() ?? "",
	};
}

function mapFinancialTypeFromLabel(
	value: ApiResponsibilityCenterFinancialType | string,
): ResponsibilityCenterFinancialType {
	if (
		value === "COST_CENTER" ||
		value === "PROFIT_CENTER" ||
		value === "REVENUE_CENTER" ||
		value === "INVESTMENT_CENTER"
	) {
		return mapFinancialTypeFromApi(value);
	}

	const normalized = String(value).toLowerCase();
	if (normalized.includes("revenue")) return "Revenue Center";
	if (normalized.includes("profit")) return "Profit Center";
	if (normalized.includes("investment")) return "Investment Center";
	return "Cost Center";
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

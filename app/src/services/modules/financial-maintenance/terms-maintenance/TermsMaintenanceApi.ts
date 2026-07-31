import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { TermsMaintenanceApiPath } from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import type {
	ApiTerm,
	ApiTermDateMode,
	ApiTermImportResponse,
	ApiTermListResponse,
	ApiTermLookupResponse,
	ApiTermSaveResponse,
	ApiTermStatus,
	TermsMaintenance,
	TermsMaintenanceDatemode,
	TermsMaintenanceFormValues,
	TermsMaintenanceListResponse,
	TermsMaintenanceLookupResponse,
	TermsMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

export async function fetchTerms(): Promise<TermsMaintenanceListResponse> {
	const response = await ApiClient.get<ApiTermListResponse>(
		TermsMaintenanceApiPath,
	);

	return {
		terms: response.data.terms.map(mapApiTerm),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function fetchTermOptions(): Promise<TermsMaintenanceLookupResponse> {
	const response = await ApiClient.get<ApiTermLookupResponse>(
		`${TermsMaintenanceApiPath}/options`,
	);

	return {
		terms: response.data.terms.map(mapApiTermOption),
	};
}

export async function createTerm(
	values: TermsMaintenanceFormValues,
): Promise<TermsMaintenance> {
	const response = await ApiClient.post<ApiTermSaveResponse>(
		TermsMaintenanceApiPath,
		toApiTermPayload(values),
	);

	return mapApiTerm(response.data.term);
}

export async function updateTerm(
	term: TermsMaintenance,
): Promise<TermsMaintenance> {
	const response = await ApiClient.patch<ApiTermSaveResponse>(
		`${TermsMaintenanceApiPath}/${term.id}`,
		toApiTermPayload(term),
	);

	return mapApiTerm(response.data.term);
}

export async function importTerms(
	terms: TermsMaintenance[],
): Promise<TermsMaintenance[]> {
	const response = await ApiClient.post<ApiTermImportResponse>(
		`${TermsMaintenanceApiPath}/import`,
		{
			terms: terms.map(toApiTermPayload),
		},
	);

	return response.data.terms.map(mapApiTerm);
}

function mapApiTerm(term: ApiTerm): TermsMaintenance {
	return {
		id: term.id,
		name: term.name,
		description: term.description ?? "",
		datemode: mapDateModeFromApi(term.dateMode),
		period: String(term.period),
		status: mapStatusFromApi(term.status),
		createdBy: term.createdBy ?? "—",
		createdAt: term.createdAt,
		updatedBy: term.updatedBy,
		updatedAt: term.updatedAt,
	};
}

function mapApiTermOption(term: ApiTermLookupResponse["terms"][number]): TermsMaintenance {
	return {
		id: term.id,
		name: term.name,
		description: "",
		datemode: mapDateModeFromApi(term.dateMode),
		period: String(term.period),
		status: mapStatusFromApi(term.status),
	};
}

function toApiTermPayload(term: TermsMaintenance | TermsMaintenanceFormValues) {
	return {
		name: term.name.trim(),
		description: term.description.trim(),
		dateMode: mapDateModeToApi(term.datemode),
		period: Number(term.period),
		status: mapStatusToApi(term.status),
	};
}

function mapDateModeFromApi(value: ApiTermDateMode): TermsMaintenanceDatemode {
	if (value === "DAY") return "Day";
	if (value === "MONTH") return "Month";
	return "Year";
}

function mapDateModeToApi(value: TermsMaintenanceDatemode): ApiTermDateMode {
	if (value === "Day") return "DAY";
	if (value === "Month") return "MONTH";
	return "YEAR";
}

function mapStatusFromApi(value: ApiTermStatus): TermsMaintenanceStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: TermsMaintenanceStatus): ApiTermStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}


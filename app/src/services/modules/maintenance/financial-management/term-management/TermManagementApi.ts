import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	TermManagement,
	TermManagementDatemode,
	TermManagementFormValues,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

type ApiTermDateMode = "DAY" | "MONTH" | "YEAR";
type ApiTermStatus = "ACTIVE" | "INACTIVE";

type ApiTerm = {
	id: string;
	name: string;
	description: string | null;
	dateMode: ApiTermDateMode;
	period: number;
	status: ApiTermStatus;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
};

export type TermManagementPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type TermManagementStatistics = {
	totalTerms: number;
	activeTerms: number;
	inactiveTerms: number;
	dayTerms: number;
	monthTerms: number;
	yearTerms: number;
};

export type TermManagementListResponse = {
	terms: TermManagement[];
	statistics: TermManagementStatistics;
	permissions: TermManagementPermissions;
};

type ApiTermListResponse = {
	terms: ApiTerm[];
	statistics: TermManagementStatistics;
	permissions: TermManagementPermissions;
};

type ApiTermSaveResponse = {
	term: ApiTerm;
};

type ApiTermImportResponse = {
	terms: ApiTerm[];
};

const TermsPath = "/maintenance/financial-management/terms";

export async function fetchTerms(): Promise<TermManagementListResponse> {
	const response = await ApiClient.get<ApiTermListResponse>(TermsPath);

	return {
		terms: response.data.terms.map(mapApiTerm),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function createTerm(
	values: TermManagementFormValues,
): Promise<TermManagement> {
	const response = await ApiClient.post<ApiTermSaveResponse>(
		TermsPath,
		toApiTermPayload(values),
	);

	return mapApiTerm(response.data.term);
}

export async function updateTerm(
	term: TermManagement,
): Promise<TermManagement> {
	const response = await ApiClient.patch<ApiTermSaveResponse>(
		`${TermsPath}/${term.id}`,
		toApiTermPayload(term),
	);

	return mapApiTerm(response.data.term);
}

export async function importTerms(
	terms: TermManagement[],
): Promise<TermManagement[]> {
	const response = await ApiClient.post<ApiTermImportResponse>(
		`${TermsPath}/import`,
		{
			terms: terms.map(toApiTermPayload),
		},
	);

	return response.data.terms.map(mapApiTerm);
}

function mapApiTerm(term: ApiTerm): TermManagement {
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

function toApiTermPayload(term: TermManagement | TermManagementFormValues) {
	return {
		name: term.name.trim(),
		description: term.description.trim(),
		dateMode: mapDateModeToApi(term.datemode),
		period: Number(term.period),
		status: mapStatusToApi(term.status),
	};
}

function mapDateModeFromApi(value: ApiTermDateMode): TermManagementDatemode {
	if (value === "DAY") return "Day";
	if (value === "MONTH") return "Month";
	return "Year";
}

function mapDateModeToApi(value: TermManagementDatemode): ApiTermDateMode {
	if (value === "Day") return "DAY";
	if (value === "Month") return "MONTH";
	return "YEAR";
}

function mapStatusFromApi(value: ApiTermStatus): TermManagementStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: TermManagementStatus): ApiTermStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

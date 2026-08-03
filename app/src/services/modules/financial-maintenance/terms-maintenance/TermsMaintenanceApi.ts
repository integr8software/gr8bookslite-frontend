import {
  termsMaintenanceControllerCreateV1,
  termsMaintenanceControllerFindAllV1,
  termsMaintenanceControllerFindOptionsV1,
  termsMaintenanceControllerImportTermsV1,
  termsMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/terms-maintenance/terms-maintenance";
import type {
  CreateTermDto,
  CreateTermDtoDateMode,
  CreateTermDtoStatus,
  TermLookupOptionResponseDto,
  TermResponseDto,
  TermResponseDtoDateMode,
  TermResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  TermsMaintenance,
  TermsMaintenanceDatemode,
  TermsMaintenanceFormValues,
  TermsMaintenanceListResponse,
  TermsMaintenanceLookupResponse,
  TermsMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

export async function fetchTerms(): Promise<TermsMaintenanceListResponse> {
  const response = await termsMaintenanceControllerFindAllV1();

  return {
    terms: response.terms.map(mapApiTerm),
    statistics: response.statistics,
    permissions: {
      ...response.permissions,
      canImport: response.permissions.canImport ?? false,
    },
  };
}

export async function fetchTermOptions(): Promise<TermsMaintenanceLookupResponse> {
  const response = await termsMaintenanceControllerFindOptionsV1();

  return {
    terms: response.terms.map(mapApiTermOption),
  };
}

export async function createTerm(values: TermsMaintenanceFormValues): Promise<TermsMaintenance> {
  const response = await termsMaintenanceControllerCreateV1(toApiTermPayload(values));

  return mapApiTerm(response.term);
}

export async function updateTerm(term: TermsMaintenance): Promise<TermsMaintenance> {
  const response = await termsMaintenanceControllerUpdateV1(term.id, toApiTermPayload(term));

  return mapApiTerm(response.term);
}

export async function importTerms(terms: TermsMaintenance[]): Promise<TermsMaintenance[]> {
  const response = await termsMaintenanceControllerImportTermsV1({
    terms: terms.map(toApiTermPayload),
  });

  return response.terms.map(mapApiTerm);
}

function mapApiTerm(term: TermResponseDto): TermsMaintenance {
  return {
    id: term.id,
    name: term.name,
    description: term.description ?? "",
    datemode: mapDateModeFromApi(term.dateMode),
    period: String(term.period),
    status: mapStatusFromApi(term.status),
    createdBy: term.createdBy ?? "-",
    createdAt: term.createdAt,
    updatedBy: term.updatedBy,
    updatedAt: term.updatedAt,
  };
}

function mapApiTermOption(term: TermLookupOptionResponseDto): TermsMaintenance {
  return {
    id: term.id,
    name: term.name,
    description: "",
    datemode: mapDateModeFromApi(term.dateMode),
    period: String(term.period),
    status: mapStatusFromApi(term.status),
  };
}

function toApiTermPayload(term: TermsMaintenance | TermsMaintenanceFormValues): CreateTermDto {
  return {
    name: term.name.trim(),
    description: term.description.trim(),
    dateMode: mapDateModeToApi(term.datemode),
    period: Number(term.period),
    status: mapStatusToApi(term.status),
  };
}

function mapDateModeFromApi(
  value: TermResponseDtoDateMode | TermLookupOptionResponseDto["dateMode"],
): TermsMaintenanceDatemode {
  if (value === "DAY") return "Day";
  if (value === "MONTH") return "Month";
  return "Year";
}

function mapDateModeToApi(value: TermsMaintenanceDatemode): CreateTermDtoDateMode {
  if (value === "Day") return "DAY";
  if (value === "Month") return "MONTH";
  return "YEAR";
}

function mapStatusFromApi(
  value: TermResponseDtoStatus | TermLookupOptionResponseDto["status"],
): TermsMaintenanceStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: TermsMaintenanceStatus): CreateTermDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

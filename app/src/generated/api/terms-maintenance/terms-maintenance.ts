/**
 * Generated-style API client for Terms Maintenance.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateTermDto,
  ImportTermsDto,
  ImportTermsResponseDto,
  SaveTermResponseDto,
  TermContainerResponseDto,
  TermListResponseDto,
  TermLookupResponseDto,
  TermsMaintenanceControllerFindAllV1Params,
  TermsMaintenanceControllerFindOptionsV1Params,
  UpdateTermDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const termsMaintenanceControllerFindAllV1 = (
  params?: TermsMaintenanceControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<TermListResponseDto>(
    {
      url: `/api/v1/maintenance/terms-maintenance`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const termsMaintenanceControllerFindOptionsV1 = (
  params?: TermsMaintenanceControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<TermLookupResponseDto>(
    {
      url: `/api/v1/maintenance/terms-maintenance/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const termsMaintenanceControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<TermContainerResponseDto>(
    {
      url: `/api/v1/maintenance/terms-maintenance/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const termsMaintenanceControllerCreateV1 = (
  createTermDto: CreateTermDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveTermResponseDto>(
    {
      url: `/api/v1/maintenance/terms-maintenance`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createTermDto,
      signal,
    },
    options,
  );
};

export const termsMaintenanceControllerImportTermsV1 = (
  importTermsDto: ImportTermsDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ImportTermsResponseDto>(
    {
      url: `/api/v1/maintenance/terms-maintenance/import`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: importTermsDto,
      signal,
    },
    options,
  );
};

export const termsMaintenanceControllerUpdateV1 = (
  id: string,
  updateTermDto: UpdateTermDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveTermResponseDto>(
    {
      url: `/api/v1/maintenance/terms-maintenance/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateTermDto,
      signal,
    },
    options,
  );
};

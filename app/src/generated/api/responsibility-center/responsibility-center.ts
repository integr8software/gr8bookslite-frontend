/**
 * Generated-style API client for Responsibility Center.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateResponsibilityCenterDto,
  ResponsibilityCenterClassificationsResponseDto,
  ResponsibilityCenterCodeSuggestionResponseDto,
  ResponsibilityCenterContainerResponseDto,
  ResponsibilityCenterControllerFindAllV1Params,
  ResponsibilityCenterControllerFindOptionsV1Params,
  ResponsibilityCenterControllerFindTreeV1Params,
  ResponsibilityCenterControllerFindTypesV1Params,
  ResponsibilityCenterControllerSuggestCodeV1Params,
  ResponsibilityCenterListResponseDto,
  ResponsibilityCenterLookupControllerFindOptionsV1Params,
  ResponsibilityCenterOptionsResponseDto,
  ResponsibilityCenterTreeResponseDto,
  ResponsibilityCenterTypesResponseDto,
  SaveResponsibilityCenterResponseDto,
  UpdateResponsibilityCenterDto,
  UpdateResponsibilityCenterStatusDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const responsibilityCenterControllerFindAllV1 = (
  params?: ResponsibilityCenterControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterListResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerFindOptionsV1 = (
  params?: ResponsibilityCenterControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerFindTreeV1 = (
  params?: ResponsibilityCenterControllerFindTreeV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterTreeResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/tree`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerFindClassificationsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterClassificationsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/classifications`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerFindTypesV1 = (
  params?: ResponsibilityCenterControllerFindTypesV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterTypesResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/types`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerSuggestCodeV1 = (
  params: ResponsibilityCenterControllerSuggestCodeV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterCodeSuggestionResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/code-suggestion`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterContainerResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerCreateV1 = (
  createResponsibilityCenterDto: CreateResponsibilityCenterDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveResponsibilityCenterResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createResponsibilityCenterDto,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerUpdateV1 = (
  id: string,
  updateResponsibilityCenterDto: UpdateResponsibilityCenterDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveResponsibilityCenterResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateResponsibilityCenterDto,
      signal,
    },
    options,
  );
};

export const responsibilityCenterControllerUpdateStatusV1 = (
  id: string,
  updateResponsibilityCenterStatusDto: UpdateResponsibilityCenterStatusDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveResponsibilityCenterResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/responsibility-centers/${id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateResponsibilityCenterStatusDto,
      signal,
    },
    options,
  );
};

export const responsibilityCenterLookupControllerFindOptionsV1 = (
  params?: ResponsibilityCenterLookupControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ResponsibilityCenterOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/responsibility-center/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

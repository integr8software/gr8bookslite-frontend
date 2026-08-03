/**
 * Generated-style API client for Default Account.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateChartAccountDto,
  CreateDefaultAccountTemplateDto,
  DefaultAccountContainerResponseDto,
  DefaultAccountControllerFindAllV1Params,
  DefaultAccountExpenseParentOptionsResponseDto,
  DefaultAccountListResponseDto,
  SaveDefaultAccountExpenseSubAccountResponseDto,
  SaveDefaultAccountResponseDto,
  UpdateDefaultAccountTemplateDto,
  UpdateDefaultAccountTemplateStatusDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const defaultAccountControllerFindAllV1 = (
  params?: DefaultAccountControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<DefaultAccountListResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const defaultAccountControllerFindExpenseParentOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<DefaultAccountExpenseParentOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts/expense-parent-options`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const defaultAccountControllerCreateExpenseSubAccountV1 = (
  createChartAccountDto: CreateChartAccountDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveDefaultAccountExpenseSubAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts/expense-sub-accounts`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createChartAccountDto,
      signal,
    },
    options,
  );
};

export const defaultAccountControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<DefaultAccountContainerResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const defaultAccountControllerCreateV1 = (
  createDefaultAccountTemplateDto: CreateDefaultAccountTemplateDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveDefaultAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createDefaultAccountTemplateDto,
      signal,
    },
    options,
  );
};

export const defaultAccountControllerUpdateV1 = (
  id: string,
  updateDefaultAccountTemplateDto: UpdateDefaultAccountTemplateDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveDefaultAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateDefaultAccountTemplateDto,
      signal,
    },
    options,
  );
};

export const defaultAccountControllerUpdateStatusV1 = (
  id: string,
  updateDefaultAccountTemplateStatusDto: UpdateDefaultAccountTemplateStatusDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveDefaultAccountResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/default-accounts/${id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateDefaultAccountTemplateStatusDto,
      signal,
    },
    options,
  );
};

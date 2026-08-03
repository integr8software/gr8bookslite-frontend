/**
 * Generated-style API client for Discount Maintenance.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateDiscountDto,
  DiscountContainerResponseDto,
  DiscountListResponseDto,
  DiscountMaintenanceControllerFindAllV1Params,
  DiscountMaintenanceControllerFindOptionsV1Params,
  DiscountOptionsResponseDto,
  ImportDiscountsDto,
  ImportDiscountsResponseDto,
  SaveDiscountResponseDto,
  UpdateDiscountDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const discountMaintenanceControllerFindAllV1 = (
  params?: DiscountMaintenanceControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<DiscountListResponseDto>(
    {
      url: `/api/v1/maintenance/discount-maintenance`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const discountMaintenanceControllerFindOptionsV1 = (
  params?: DiscountMaintenanceControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<DiscountOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/discount-maintenance/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const discountMaintenanceControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<DiscountContainerResponseDto>(
    {
      url: `/api/v1/maintenance/discount-maintenance/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const discountMaintenanceControllerCreateV1 = (
  createDiscountDto: CreateDiscountDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveDiscountResponseDto>(
    {
      url: `/api/v1/maintenance/discount-maintenance`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createDiscountDto,
      signal,
    },
    options,
  );
};

export const discountMaintenanceControllerImportDiscountsV1 = (
  importDiscountsDto: ImportDiscountsDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ImportDiscountsResponseDto>(
    {
      url: `/api/v1/maintenance/discount-maintenance/import`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: importDiscountsDto,
      signal,
    },
    options,
  );
};

export const discountMaintenanceControllerUpdateV1 = (
  id: string,
  updateDiscountDto: UpdateDiscountDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveDiscountResponseDto>(
    {
      url: `/api/v1/maintenance/discount-maintenance/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateDiscountDto,
      signal,
    },
    options,
  );
};

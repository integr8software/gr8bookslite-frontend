/**
 * Generated-style API client for Warehouse Maintenance.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateWarehouseDto,
  SaveWarehouseResponseDto,
  UpdateWarehouseDto,
  WarehouseContainerResponseDto,
  WarehouseListResponseDto,
  WarehouseMaintenanceControllerFindAllV1Params,
  WarehouseMaintenanceControllerFindOptionsV1Params,
  WarehouseOptionsResponseDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const warehouseMaintenanceControllerFindAllV1 = (
  params?: WarehouseMaintenanceControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<WarehouseListResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-maintenance`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const warehouseMaintenanceControllerFindOptionsV1 = (
  params?: WarehouseMaintenanceControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<WarehouseOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-maintenance/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const warehouseMaintenanceControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<WarehouseContainerResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-maintenance/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const warehouseMaintenanceControllerCreateV1 = (
  createWarehouseDto: CreateWarehouseDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveWarehouseResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-maintenance`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createWarehouseDto,
      signal,
    },
    options,
  );
};

export const warehouseMaintenanceControllerUpdateV1 = (
  id: string,
  updateWarehouseDto: UpdateWarehouseDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveWarehouseResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-maintenance/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateWarehouseDto,
      signal,
    },
    options,
  );
};

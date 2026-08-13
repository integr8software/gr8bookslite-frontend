/**
 * Generated-style API client for Warehouse Access.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateWarehouseAccessDto,
  CreateWarehouseAccessResponseDto,
  SaveWarehouseAccessResponseDto,
  UpdateWarehouseAccessDto,
  WarehouseAccessContainerResponseDto,
  WarehouseAccessControllerFindAllV1Params,
  WarehouseAccessControllerFindDirectoryUsersV1Params,
  WarehouseAccessDirectoryResponseDto,
  WarehouseAccessListResponseDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const warehouseAccessControllerFindAllV1 = (
  params?: WarehouseAccessControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<WarehouseAccessListResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-access`,
      method: "GET",
      params,
      signal,
    },
    options,
  );

export const warehouseAccessControllerFindDirectoryUsersV1 = (
  params?: WarehouseAccessControllerFindDirectoryUsersV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<WarehouseAccessDirectoryResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-access/directory/users`,
      method: "GET",
      params,
      signal,
    },
    options,
  );

export const warehouseAccessControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<WarehouseAccessContainerResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-access/${id}`,
      method: "GET",
      signal,
    },
    options,
  );

export const warehouseAccessControllerCreateV1 = (
  createWarehouseAccessDto: CreateWarehouseAccessDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<CreateWarehouseAccessResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-access`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createWarehouseAccessDto,
      signal,
    },
    options,
  );

export const warehouseAccessControllerUpdateV1 = (
  id: string,
  updateWarehouseAccessDto: UpdateWarehouseAccessDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<SaveWarehouseAccessResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-access/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateWarehouseAccessDto,
      signal,
    },
    options,
  );

export const warehouseAccessControllerRevokeV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<SaveWarehouseAccessResponseDto>(
    {
      url: `/api/v1/maintenance/warehouse-access/${id}`,
      method: "DELETE",
      signal,
    },
    options,
  );

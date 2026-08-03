/**
 * Generated-style API client for Services Maintenance.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateServiceMaintenanceDto,
  SaveServiceMaintenanceResponseDto,
  ServiceMaintenanceAccountOptionsResponseDto,
  ServiceMaintenanceContainerResponseDto,
  ServiceMaintenanceListResponseDto,
  ServiceMaintenanceNextAccountCodeResponseDto,
  ServiceMaintenanceOptionsResponseDto,
  ServicesMaintenanceControllerFindAllV1Params,
  ServicesMaintenanceControllerFindOptionsV1Params,
  ServicesMaintenanceLookupControllerFindOptionsV1Params,
  UpdateServiceMaintenanceDto,
  UpdateServiceMaintenanceStatusDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const servicesMaintenanceControllerFindAllV1 = (
  params?: ServicesMaintenanceControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ServiceMaintenanceListResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerFindOptionsV1 = (
  params?: ServicesMaintenanceControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ServiceMaintenanceOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerGetAccountOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ServiceMaintenanceAccountOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance/account-options`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerGetNextAccountCodeV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ServiceMaintenanceNextAccountCodeResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance/next-account-code`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ServiceMaintenanceContainerResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerCreateV1 = (
  createServiceMaintenanceDto: CreateServiceMaintenanceDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveServiceMaintenanceResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createServiceMaintenanceDto,
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerUpdateV1 = (
  id: string,
  updateServiceMaintenanceDto: UpdateServiceMaintenanceDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveServiceMaintenanceResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateServiceMaintenanceDto,
      signal,
    },
    options,
  );
};

export const servicesMaintenanceControllerUpdateStatusV1 = (
  id: string,
  updateServiceMaintenanceStatusDto: UpdateServiceMaintenanceStatusDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveServiceMaintenanceResponseDto>(
    {
      url: `/api/v1/maintenance/financial-management/services-maintenance/${id}/status`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateServiceMaintenanceStatusDto,
      signal,
    },
    options,
  );
};

export const servicesMaintenanceLookupControllerFindOptionsV1 = (
  params?: ServicesMaintenanceLookupControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ServiceMaintenanceOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/services-maintenance/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

/**
 * Generated-style API client for Payment Type Maintenance.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreatePaymentTypeDto,
  ImportPaymentTypesDto,
  ImportPaymentTypesResponseDto,
  PaymentTypeContainerResponseDto,
  PaymentTypeListResponseDto,
  PaymentTypeMaintenanceControllerFindAllV1Params,
  PaymentTypeMaintenanceControllerFindOptionsV1Params,
  PaymentTypeOptionsResponseDto,
  SavePaymentTypeResponseDto,
  UpdatePaymentTypeDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const paymentTypeMaintenanceControllerFindAllV1 = (
  params?: PaymentTypeMaintenanceControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PaymentTypeListResponseDto>(
    {
      url: `/api/v1/maintenance/payment-type-maintenance`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const paymentTypeMaintenanceControllerFindOptionsV1 = (
  params?: PaymentTypeMaintenanceControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PaymentTypeOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/payment-type-maintenance/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const paymentTypeMaintenanceControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<PaymentTypeContainerResponseDto>(
    {
      url: `/api/v1/maintenance/payment-type-maintenance/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const paymentTypeMaintenanceControllerCreateV1 = (
  createPaymentTypeDto: CreatePaymentTypeDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SavePaymentTypeResponseDto>(
    {
      url: `/api/v1/maintenance/payment-type-maintenance`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createPaymentTypeDto,
      signal,
    },
    options,
  );
};

export const paymentTypeMaintenanceControllerImportPaymentTypesV1 = (
  importPaymentTypesDto: ImportPaymentTypesDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ImportPaymentTypesResponseDto>(
    {
      url: `/api/v1/maintenance/payment-type-maintenance/import`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: importPaymentTypesDto,
      signal,
    },
    options,
  );
};

export const paymentTypeMaintenanceControllerUpdateV1 = (
  id: string,
  updatePaymentTypeDto: UpdatePaymentTypeDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SavePaymentTypeResponseDto>(
    {
      url: `/api/v1/maintenance/payment-type-maintenance/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updatePaymentTypeDto,
      signal,
    },
    options,
  );
};

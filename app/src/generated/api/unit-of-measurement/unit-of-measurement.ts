/**
 * Generated-style API client for Unit of Measurement.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateUnitOfMeasurementDto,
  ImportUnitOfMeasurementsDto,
  ImportUnitOfMeasurementsResponseDto,
  SaveUnitOfMeasurementResponseDto,
  UnitOfMeasurementContainerResponseDto,
  UnitOfMeasurementControllerFindAllV1Params,
  UnitOfMeasurementControllerFindOptionsV1Params,
  UnitOfMeasurementListResponseDto,
  UnitOfMeasurementOptionsResponseDto,
  UpdateUnitOfMeasurementDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const unitOfMeasurementControllerFindAllV1 = (
  params?: UnitOfMeasurementControllerFindAllV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<UnitOfMeasurementListResponseDto>(
    {
      url: `/api/v1/maintenance/unit-of-measurement`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const unitOfMeasurementControllerFindOptionsV1 = (
  params?: UnitOfMeasurementControllerFindOptionsV1Params,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<UnitOfMeasurementOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/unit-of-measurement/options`,
      method: "GET",
      params,
      signal,
    },
    options,
  );
};

export const unitOfMeasurementControllerFindOneV1 = (
  id: string,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<UnitOfMeasurementContainerResponseDto>(
    {
      url: `/api/v1/maintenance/unit-of-measurement/${id}`,
      method: "GET",
      signal,
    },
    options,
  );
};

export const unitOfMeasurementControllerCreateV1 = (
  createUnitOfMeasurementDto: CreateUnitOfMeasurementDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveUnitOfMeasurementResponseDto>(
    {
      url: `/api/v1/maintenance/unit-of-measurement`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createUnitOfMeasurementDto,
      signal,
    },
    options,
  );
};

export const unitOfMeasurementControllerImportUnitsV1 = (
  importUnitOfMeasurementsDto: ImportUnitOfMeasurementsDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<ImportUnitOfMeasurementsResponseDto>(
    {
      url: `/api/v1/maintenance/unit-of-measurement/import`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: importUnitOfMeasurementsDto,
      signal,
    },
    options,
  );
};

export const unitOfMeasurementControllerUpdateV1 = (
  id: string,
  updateUnitOfMeasurementDto: UpdateUnitOfMeasurementDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) => {
  return OrvalApiClient<SaveUnitOfMeasurementResponseDto>(
    {
      url: `/api/v1/maintenance/unit-of-measurement/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateUnitOfMeasurementDto,
      signal,
    },
    options,
  );
};

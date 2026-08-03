import {
  unitOfMeasurementControllerCreateV1,
  unitOfMeasurementControllerFindAllV1,
  unitOfMeasurementControllerImportUnitsV1,
  unitOfMeasurementControllerUpdateV1,
} from "@/app/src/generated/api/unit-of-measurement/unit-of-measurement";
import type {
  CreateUnitOfMeasurementDto,
  CreateUnitOfMeasurementDtoQuantityMode,
  CreateUnitOfMeasurementDtoStatus,
  UnitOfMeasurementResponseDto,
  UnitOfMeasurementResponseDtoQuantityMode,
  UnitOfMeasurementResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  UnitOfMeasurementFormValues,
  UnitOfMeasurementListResponse,
  UnitOfMeasurementQuantityMode,
  UnitOfMeasurementRecord,
  UnitOfMeasurementStatus,
} from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";

export async function fetchUnitsOfMeasurement(): Promise<UnitOfMeasurementListResponse> {
  const response = await unitOfMeasurementControllerFindAllV1({
    limit: 500,
  });

  return {
    records: response.units.map(mapApiUnitOfMeasurement),
    statistics: response.statistics,
    permissions: {
      canView: response.permissions.canView,
      canCreate: response.permissions.canCreate,
      canUpdate: response.permissions.canUpdate,
      canExport: response.permissions.canExport,
      canImport: response.permissions.canImport ?? response.permissions.canCreate,
    },
  };
}

export async function createUnitOfMeasurement(
  values: UnitOfMeasurementFormValues,
): Promise<UnitOfMeasurementRecord> {
  const response = await unitOfMeasurementControllerCreateV1(toApiUnitOfMeasurementPayload(values));

  return mapApiUnitOfMeasurement(response.unit);
}

export async function updateUnitOfMeasurement(
  record: UnitOfMeasurementRecord,
): Promise<UnitOfMeasurementRecord> {
  const response = await unitOfMeasurementControllerUpdateV1(
    record.id,
    toApiUnitOfMeasurementPayload(record),
  );

  return mapApiUnitOfMeasurement(response.unit);
}

export async function importUnitsOfMeasurement(
  records: UnitOfMeasurementRecord[],
): Promise<UnitOfMeasurementRecord[]> {
  const response = await unitOfMeasurementControllerImportUnitsV1({
    units: records.map(toApiUnitOfMeasurementPayload),
  });

  return response.units.map(mapApiUnitOfMeasurement);
}

function mapApiUnitOfMeasurement(unit: UnitOfMeasurementResponseDto): UnitOfMeasurementRecord {
  return {
    id: unit.id,
    name: unit.name,
    symbol: unit.symbol,
    quantityMode: mapQuantityModeFromApi(unit.quantityMode),
    status: mapStatusFromApi(unit.status),
    createdBy: unit.createdBy ?? "-",
    createdAt: unit.createdAt,
    updatedBy: unit.updatedBy,
    updatedAt: unit.updatedAt ?? undefined,
  };
}

function toApiUnitOfMeasurementPayload(
  record: UnitOfMeasurementRecord | UnitOfMeasurementFormValues,
): CreateUnitOfMeasurementDto {
  return {
    name: record.name.trim(),
    symbol: record.symbol.trim().toUpperCase(),
    quantityMode: mapQuantityModeToApi(record.quantityMode),
    status: mapStatusToApi(record.status),
  };
}

function mapQuantityModeFromApi(
  value: UnitOfMeasurementResponseDtoQuantityMode,
): UnitOfMeasurementQuantityMode {
  return value === "INTEGER" ? "Integer" : "Float";
}

function mapQuantityModeToApi(
  value: UnitOfMeasurementQuantityMode,
): CreateUnitOfMeasurementDtoQuantityMode {
  return value === "Integer" ? "INTEGER" : "FLOAT";
}

function mapStatusFromApi(value: UnitOfMeasurementResponseDtoStatus): UnitOfMeasurementStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: UnitOfMeasurementStatus): CreateUnitOfMeasurementDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

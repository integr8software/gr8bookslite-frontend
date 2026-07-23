import { UnitOfMeasurementApiPath } from "@/app/src/constants/modules/item-management/unit-of-measurement/UnitOfMeasurementConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	ApiUnitOfMeasurement,
	ApiUnitOfMeasurementImportResponse,
	ApiUnitOfMeasurementListResponse,
	ApiUnitOfMeasurementQuantityMode,
	ApiUnitOfMeasurementSaveResponse,
	ApiUnitOfMeasurementStatus,
	UnitOfMeasurementFormValues,
	UnitOfMeasurementListResponse,
	UnitOfMeasurementQuantityMode,
	UnitOfMeasurementRecord,
	UnitOfMeasurementStatus,
} from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";

export async function fetchUnitsOfMeasurement(): Promise<UnitOfMeasurementListResponse> {
	const response = await ApiClient.get<ApiUnitOfMeasurementListResponse>(
		UnitOfMeasurementApiPath,
		{
			params: {
				limit: 500,
			},
		},
	);

	return {
		records: response.data.units.map(mapApiUnitOfMeasurement),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function createUnitOfMeasurement(
	values: UnitOfMeasurementFormValues,
): Promise<UnitOfMeasurementRecord> {
	const response = await ApiClient.post<ApiUnitOfMeasurementSaveResponse>(
		UnitOfMeasurementApiPath,
		toApiUnitOfMeasurementPayload(values),
	);

	return mapApiUnitOfMeasurement(response.data.unit);
}

export async function updateUnitOfMeasurement(
	record: UnitOfMeasurementRecord,
): Promise<UnitOfMeasurementRecord> {
	const response = await ApiClient.patch<ApiUnitOfMeasurementSaveResponse>(
		`${UnitOfMeasurementApiPath}/${record.id}`,
		toApiUnitOfMeasurementPayload(record),
	);

	return mapApiUnitOfMeasurement(response.data.unit);
}

export async function importUnitsOfMeasurement(
	records: UnitOfMeasurementRecord[],
): Promise<UnitOfMeasurementRecord[]> {
	const response = await ApiClient.post<ApiUnitOfMeasurementImportResponse>(
		`${UnitOfMeasurementApiPath}/import`,
		{
			units: records.map(toApiUnitOfMeasurementPayload),
		},
	);

	return response.data.units.map(mapApiUnitOfMeasurement);
}

function mapApiUnitOfMeasurement(
	unit: ApiUnitOfMeasurement,
): UnitOfMeasurementRecord {
	return {
		id: unit.id,
		name: unit.name,
		symbol: unit.symbol,
		quantityMode: mapQuantityModeFromApi(unit.quantityMode),
		status: mapStatusFromApi(unit.status),
		createdBy: unit.createdBy ?? "-",
		createdAt: unit.createdAt,
		updatedBy: unit.updatedBy,
		updatedAt: unit.updatedAt,
	};
}

function toApiUnitOfMeasurementPayload(
	record: UnitOfMeasurementRecord | UnitOfMeasurementFormValues,
) {
	return {
		name: record.name.trim(),
		symbol: record.symbol.trim().toUpperCase(),
		quantityMode: mapQuantityModeToApi(record.quantityMode),
		status: mapStatusToApi(record.status),
	};
}

function mapQuantityModeFromApi(
	value: ApiUnitOfMeasurementQuantityMode,
): UnitOfMeasurementQuantityMode {
	return value === "INTEGER" ? "Integer" : "Float";
}

function mapQuantityModeToApi(
	value: UnitOfMeasurementQuantityMode,
): ApiUnitOfMeasurementQuantityMode {
	return value === "Integer" ? "INTEGER" : "FLOAT";
}

function mapStatusFromApi(
	value: ApiUnitOfMeasurementStatus,
): UnitOfMeasurementStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(
	value: UnitOfMeasurementStatus,
): ApiUnitOfMeasurementStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}

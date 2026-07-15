import { TaxMaintenanceApiPath } from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ApiTaxMaintenance,
  ApiTaxMaintenanceListResponse,
  ApiTaxMaintenanceSaveResponse,
  ApiTaxMaintenanceStatus,
  TaxMaintenance,
  TaxMaintenanceFormValues,
  TaxMaintenanceListResponse,
  TaxMaintenanceStatus,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

export async function fetchTaxMaintenance(): Promise<TaxMaintenanceListResponse> {
  const response = await ApiClient.get<ApiTaxMaintenanceListResponse>(
    TaxMaintenanceApiPath,
    {
      params: {
        page: 1,
        limit: 500,
        sortBy: "name",
        sortDirection: "asc",
      },
    },
  );

  return {
    taxMaintenance: response.data.taxMaintenance.map(mapApiTaxMaintenance),
    statistics: response.data.statistics,
    permissions: response.data.permissions,
  };
}

export async function createTaxMaintenance(
  values: TaxMaintenanceFormValues,
): Promise<TaxMaintenance> {
  const response = await ApiClient.post<ApiTaxMaintenanceSaveResponse>(
    TaxMaintenanceApiPath,
    toApiTaxMaintenancePayload(values),
  );

  return mapApiTaxMaintenance(response.data.taxMaintenance);
}

export async function updateTaxMaintenance(
  tax: TaxMaintenance,
): Promise<TaxMaintenance> {
  const response = await ApiClient.patch<ApiTaxMaintenanceSaveResponse>(
    `${TaxMaintenanceApiPath}/${tax.id}`,
    toApiTaxMaintenancePayload(tax),
  );

  return mapApiTaxMaintenance(response.data.taxMaintenance);
}

function mapApiTaxMaintenance(tax: ApiTaxMaintenance): TaxMaintenance {
  return {
    id: tax.id,
    name: tax.name,
    percentage: String(Number(tax.percentage)),
    inputVatAccountId: tax.inputVatAccountId ?? "",
    outputVatAccountId: tax.outputVatAccountId ?? "",
    vatPayableAccountId: tax.vatPayableAccountId ?? "",
    deferredInputTaxAccountId: tax.deferredInputTaxAccountId ?? "",
    deferredOutputVatAccountId: tax.deferredOutputVatAccountId ?? "",
    accounts: tax.accounts,
    status: mapStatusFromApi(tax.status),
    createdBy: tax.createdBy ?? "",
    createdAt: tax.createdAt,
    updatedBy: tax.updatedBy ?? "",
    updatedAt: tax.updatedAt,
  };
}

function toApiTaxMaintenancePayload(
  values: TaxMaintenance | TaxMaintenanceFormValues,
) {
  return {
    name: values.name.trim(),
    percentage: Number(values.percentage || 0),
    inputVatAccountId: normalizeOptionalText(values.inputVatAccountId),
    outputVatAccountId: normalizeOptionalText(values.outputVatAccountId),
    vatPayableAccountId: normalizeOptionalText(values.vatPayableAccountId),
    deferredInputTaxAccountId: normalizeOptionalText(
      values.deferredInputTaxAccountId,
    ),
    deferredOutputVatAccountId: normalizeOptionalText(
      values.deferredOutputVatAccountId,
    ),
    status: mapStatusToApi(values.status),
  };
}

function mapStatusFromApi(value: ApiTaxMaintenanceStatus): TaxMaintenanceStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: TaxMaintenanceStatus): ApiTaxMaintenanceStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

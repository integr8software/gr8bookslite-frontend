import {
  paymentTypeMaintenanceControllerCreateV1,
  paymentTypeMaintenanceControllerFindAllV1,
  paymentTypeMaintenanceControllerImportPaymentTypesV1,
  paymentTypeMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/payment-type-maintenance/payment-type-maintenance";
import type {
  CreatePaymentTypeDto,
  CreatePaymentTypeDtoClassification,
  CreatePaymentTypeDtoStatus,
  PaymentTypeMaintenanceControllerFindAllV1Params,
  PaymentTypeResponseDto,
  PaymentTypeResponseDtoClassification,
  PaymentTypeResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PaymentTypeClassification,
  PaymentTypeListParams,
  PaymentTypeListResponse,
  PaymentTypeRecord,
  PaymentTypeSortKey,
  PaymentTypeStatus,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";

const paymentTypeCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export async function fetchPaymentTypes(params: PaymentTypeListParams = {}): Promise<PaymentTypeListResponse> {
  const response = await paymentTypeMaintenanceControllerFindAllV1(toApiPaymentTypeListParams(params));

  return {
    paymentTypes: response.paymentTypes.map(mapApiPaymentType),
    statistics: response.statistics,
    permissions: {
      ...response.permissions,
      canImport: response.permissions.canImport ?? false,
    },
  };
}

export async function createPaymentType(paymentType: PaymentTypeRecord): Promise<PaymentTypeRecord> {
  const response = await paymentTypeMaintenanceControllerCreateV1(toApiPaymentTypePayload(paymentType));

  return mapApiPaymentType(response.paymentType);
}

export async function updatePaymentType(paymentType: PaymentTypeRecord): Promise<PaymentTypeRecord> {
  const response = await paymentTypeMaintenanceControllerUpdateV1(paymentType.id, toApiPaymentTypePayload(paymentType));

  return mapApiPaymentType(response.paymentType);
}

export async function importPaymentTypes(paymentTypes: PaymentTypeRecord[]): Promise<PaymentTypeRecord[]> {
  const response = await paymentTypeMaintenanceControllerImportPaymentTypesV1({
    paymentTypes: paymentTypes.map(toApiPaymentTypePayload),
  });

  return response.paymentTypes.map(mapApiPaymentType);
}

export function applyPaymentTypeListParams(paymentTypes: PaymentTypeRecord[], params: PaymentTypeListParams = {}) {
  const normalizedSearch = params.search?.trim().toLowerCase() ?? "";
  const sortBy = params.sortBy ?? "paymentType";
  const sortDirection = params.sortDirection ?? "asc";

  return paymentTypes
    .filter((paymentType) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        paymentType.paymentType.toLowerCase().includes(normalizedSearch) ||
        paymentType.type.toLowerCase().includes(normalizedSearch) ||
        paymentType.status.toLowerCase().includes(normalizedSearch);
      const matchesType = !params.type || paymentType.type === params.type;
      const matchesStatus = !params.status || paymentType.status === params.status;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((left, right) => {
      const result = sortBy === "sortOrder" ? left.sortOrder - right.sortOrder : paymentTypeCollator.compare(left[sortBy], right[sortBy]);

      return sortDirection === "asc" ? result : -result;
    });
}

function mapApiPaymentType(paymentType: PaymentTypeResponseDto): PaymentTypeRecord {
  return {
    id: paymentType.id,
    description: paymentType.description ?? "",
    paymentType: paymentType.name,
    sortOrder: paymentType.sortOrder,
    status: mapStatusFromApi(paymentType.status),
    type: mapClassificationFromApi(paymentType.classification),
    createdBy: paymentType.createdBy ?? "System Generated",
    createdAt: paymentType.createdAt,
    updatedBy: paymentType.updatedBy,
    updatedAt: paymentType.updatedAt,
  };
}

function toApiPaymentTypePayload(paymentType: PaymentTypeRecord): CreatePaymentTypeDto {
  return {
    name: paymentType.paymentType.trim(),
    description: paymentType.description.trim(),
    classification: mapClassificationToApi(paymentType.type),
    sortOrder: paymentType.sortOrder,
    status: mapStatusToApi(paymentType.status),
  };
}

function toApiPaymentTypeListParams(params: PaymentTypeListParams): PaymentTypeMaintenanceControllerFindAllV1Params {
  return {
    search: params.search?.trim() || undefined,
    sortBy: mapSortKeyToApi(params.sortBy),
    sortDirection: params.sortDirection,
    status: params.status ? mapStatusToApi(params.status) : undefined,
    classification: params.type ? mapClassificationToApi(params.type) : undefined,
  };
}

function mapSortKeyToApi(sortBy?: PaymentTypeSortKey) {
  if (!sortBy) {
    return undefined;
  }

  if (sortBy === "paymentType") {
    return "name";
  }

  if (sortBy === "sortOrder") {
    return "sortOrder";
  }

  if (sortBy === "type") {
    return "classification";
  }

  return sortBy;
}

function mapClassificationFromApi(value: PaymentTypeResponseDtoClassification): PaymentTypeClassification {
  if (value === "CASH") return "Cash";
  if (value === "BANK_TRANSFER") return "Bank Transfer";
  if (value === "CHECK") return "Check";
  if (value === "DIGITAL_WALLET") return "Digital Wallet";
  return "Non-Cash Settlement";
}

function mapClassificationToApi(value: PaymentTypeClassification): CreatePaymentTypeDtoClassification {
  if (value === "Cash") return "CASH";
  if (value === "Bank Transfer") return "BANK_TRANSFER";
  if (value === "Check") return "CHECK";
  if (value === "Digital Wallet") return "DIGITAL_WALLET";
  return "NON_CASH_SETTLEMENT";
}

function mapStatusFromApi(value: PaymentTypeResponseDtoStatus): PaymentTypeStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: PaymentTypeStatus): CreatePaymentTypeDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

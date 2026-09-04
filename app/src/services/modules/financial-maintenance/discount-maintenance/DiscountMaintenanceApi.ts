import {
  discountMaintenanceControllerCreateV1,
  discountMaintenanceControllerFindAllV1,
  discountMaintenanceControllerImportDiscountsV1,
  discountMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/discount-maintenance/discount-maintenance";
import type {
  CreateDiscountDto,
  CreateDiscountDtoStatus,
  CreateDiscountDtoType,
  CreateDiscountDtoValueType,
  DiscountResponseDto,
  DiscountResponseDtoStatus,
  DiscountResponseDtoType,
  DiscountResponseDtoValueType,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  Discount,
  DiscountMaintenanceFormValues,
  DiscountMaintenanceListResult,
  DiscountStatus,
  DiscountTransactionType,
  DiscountType,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";

export async function fetchDiscounts(): Promise<DiscountMaintenanceListResult> {
  const response = await discountMaintenanceControllerFindAllV1();

  return {
    discounts: response.discounts.map(mapApiDiscount),
    statistics: response.statistics,
    permissions: {
      ...response.permissions,
      canImport: response.permissions.canImport ?? false,
    },
  };
}

export async function createDiscount(
  values: DiscountMaintenanceFormValues | Discount,
): Promise<Discount & { message?: string }> {
  const response = await discountMaintenanceControllerCreateV1(toApiDiscountPayload(values));

  return {
    ...mapApiDiscount(response.discount),
    message: response.message,
  };
}

export async function updateDiscount(discount: Discount): Promise<Discount> {
  const response = await discountMaintenanceControllerUpdateV1(discount.id, toApiDiscountPayload(discount));

  return mapApiDiscount(response.discount);
}

export async function importDiscounts(discounts: Discount[]): Promise<Discount[]> {
  const response = await discountMaintenanceControllerImportDiscountsV1({
    discounts: discounts.map(toApiDiscountPayload),
  });

  return response.discounts.map(mapApiDiscount);
}

function mapApiDiscount(discount: DiscountResponseDto): Discount {
  return {
    id: discount.id,
    name: discount.name,
    description: discount.description ?? "",
    type: mapTypeFromApi(discount.type),
    discountType: mapValueTypeFromApi(discount.valueType),
    amount: Number(discount.value),
    status: mapStatusFromApi(discount.status),
    accountId: discount.chartAccountId,
    accountCode: discount.accountCode,
    accountTitle: discount.accountTitle,
    accountGroupPath: discount.accountGroupPath,
    createdBy: discount.createdBy,
    createdAt: discount.createdAt,
    updatedBy: discount.updatedBy,
    updatedAt: discount.updatedAt,
  };
}

function toApiDiscountPayload(discount: Discount | DiscountMaintenanceFormValues): CreateDiscountDto {
  return {
    name: discount.name.trim(),
    description: discount.description.trim(),
    type: mapTypeToApi(discount.type),
    valueType: mapValueTypeToApi(discount.discountType),
    value: typeof discount.amount === "string" ? Number(discount.amount) : discount.amount,
    status: mapStatusToApi(discount.status),
  };
}

function mapTypeFromApi(value: DiscountResponseDtoType): DiscountTransactionType {
  return value === "PURCHASES" ? "Purchases" : "Sales";
}

function mapTypeToApi(value: DiscountTransactionType): CreateDiscountDtoType {
  return value === "Purchases" ? "PURCHASES" : "SALES";
}

function mapValueTypeFromApi(value: DiscountResponseDtoValueType): DiscountType {
  return value === "FIXED" ? "Fixed" : "Percentage";
}

function mapValueTypeToApi(value: DiscountType): CreateDiscountDtoValueType {
  return value === "Fixed" ? "FIXED" : "PERCENTAGE";
}

function mapStatusFromApi(value: DiscountResponseDtoStatus): DiscountStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: DiscountStatus): CreateDiscountDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

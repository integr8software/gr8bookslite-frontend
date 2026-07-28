import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { DiscountMaintenanceApiPath } from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type {
	ApiDiscount,
	ApiDiscountImportResponse,
	ApiDiscountListResponse,
	ApiDiscountSaveResponse,
	ApiDiscountStatus,
	ApiDiscountType,
	ApiDiscountValueType,
	Discount,
	DiscountMaintenanceFormValues,
	DiscountMaintenanceListResponse,
	DiscountStatus,
	DiscountTransactionType,
	DiscountType,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";

export async function fetchDiscounts(): Promise<DiscountMaintenanceListResponse> {
	const response = await ApiClient.get<ApiDiscountListResponse>(
		DiscountMaintenanceApiPath,
	);

	return {
		discounts: response.data.discounts.map(mapApiDiscount),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function createDiscount(
	values: DiscountMaintenanceFormValues | Discount,
): Promise<Discount> {
	const response = await ApiClient.post<ApiDiscountSaveResponse>(
		DiscountMaintenanceApiPath,
		toApiDiscountPayload(values),
	);

	return mapApiDiscount(response.data.discount);
}

export async function updateDiscount(discount: Discount): Promise<Discount> {
	const response = await ApiClient.patch<ApiDiscountSaveResponse>(
		`${DiscountMaintenanceApiPath}/${discount.id}`,
		toApiDiscountPayload(discount),
	);

	return mapApiDiscount(response.data.discount);
}

export async function importDiscounts(discounts: Discount[]): Promise<Discount[]> {
	const response = await ApiClient.post<ApiDiscountImportResponse>(
		`${DiscountMaintenanceApiPath}/import`,
		{
			discounts: discounts.map(toApiDiscountPayload),
		},
	);

	return response.data.discounts.map(mapApiDiscount);
}

function mapApiDiscount(discount: ApiDiscount): Discount {
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

function toApiDiscountPayload(
	discount: Discount | DiscountMaintenanceFormValues,
) {
	return {
		name: discount.name.trim(),
		description: discount.description.trim(),
		type: mapTypeToApi(discount.type),
		valueType: mapValueTypeToApi(discount.discountType),
		value:
			typeof discount.amount === "string"
				? Number(discount.amount)
				: discount.amount,
		status: mapStatusToApi(discount.status),
	};
}

function mapTypeFromApi(value: ApiDiscountType): DiscountTransactionType {
	return value === "PURCHASE" ? "Purchase" : "Sales";
}

function mapTypeToApi(value: DiscountTransactionType): ApiDiscountType {
	return value === "Purchase" ? "PURCHASE" : "SALES";
}

function mapValueTypeFromApi(value: ApiDiscountValueType): DiscountType {
	return value === "FIXED" ? "Fixed" : "Percentage";
}

function mapValueTypeToApi(value: DiscountType): ApiDiscountValueType {
	return value === "Fixed" ? "FIXED" : "PERCENTAGE";
}

function mapStatusFromApi(value: ApiDiscountStatus): DiscountStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: DiscountStatus): ApiDiscountStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}


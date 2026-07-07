import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	Discount,
	DiscountManagementFormValues,
	DiscountManagementPermissions,
	DiscountManagementStatistics,
	DiscountStatus,
	DiscountTransactionType,
	DiscountType,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";

type ApiDiscountType = "SALES" | "PURCHASE";
type ApiDiscountValueType = "PERCENTAGE" | "FIXED";
type ApiDiscountStatus = "ACTIVE" | "INACTIVE";

type ApiDiscount = {
	id: string;
	name: string;
	description: string | null;
	type: ApiDiscountType;
	valueType: ApiDiscountValueType;
	value: string;
	status: ApiDiscountStatus;
	chartAccountId: string;
	accountCode: string;
	accountTitle: string;
	accountGroupPath: string;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
};

export type DiscountManagementListResponse = {
	discounts: Discount[];
	statistics: DiscountManagementStatistics;
	permissions: DiscountManagementPermissions;
};

type ApiDiscountListResponse = {
	discounts: ApiDiscount[];
	statistics: DiscountManagementStatistics;
	permissions: DiscountManagementPermissions;
};

type ApiDiscountSaveResponse = {
	discount: ApiDiscount;
};

type ApiDiscountImportResponse = {
	discounts: ApiDiscount[];
};

const DiscountsPath = "/maintenance/financial-management/discounts";

export async function fetchDiscounts(): Promise<DiscountManagementListResponse> {
	const response = await ApiClient.get<ApiDiscountListResponse>(DiscountsPath);

	return {
		discounts: response.data.discounts.map(mapApiDiscount),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function createDiscount(
	values: DiscountManagementFormValues | Discount,
): Promise<Discount> {
	const response = await ApiClient.post<ApiDiscountSaveResponse>(
		DiscountsPath,
		toApiDiscountPayload(values),
	);

	return mapApiDiscount(response.data.discount);
}

export async function updateDiscount(discount: Discount): Promise<Discount> {
	const response = await ApiClient.patch<ApiDiscountSaveResponse>(
		`${DiscountsPath}/${discount.id}`,
		toApiDiscountPayload(discount),
	);

	return mapApiDiscount(response.data.discount);
}

export async function importDiscounts(discounts: Discount[]): Promise<Discount[]> {
	const response = await ApiClient.post<ApiDiscountImportResponse>(
		`${DiscountsPath}/import`,
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
	};
}

function toApiDiscountPayload(
	discount: Discount | DiscountManagementFormValues,
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

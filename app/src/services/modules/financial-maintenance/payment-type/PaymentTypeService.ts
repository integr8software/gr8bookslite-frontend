import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { PaymentTypeApiPath } from "@/app/src/constants/modules/financial-maintenance/payment-type/PaymentTypeConstants";
import type {
	ApiPaymentType,
	ApiPaymentTypeClassification,
	ApiPaymentTypeImportResponse,
	ApiPaymentTypeListResponse,
	ApiPaymentTypeSaveResponse,
	ApiPaymentTypeStatus,
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

export async function fetchPaymentTypes(
	params: PaymentTypeListParams = {},
): Promise<PaymentTypeListResponse> {
	const response = await ApiClient.get<ApiPaymentTypeListResponse>(
		PaymentTypeApiPath,
		{
			params: toApiPaymentTypeListParams(params),
		},
	);

	return {
		paymentTypes: response.data.paymentTypes.map(mapApiPaymentType),
		statistics: response.data.statistics,
		permissions: response.data.permissions,
	};
}

export async function createPaymentType(
	paymentType: PaymentTypeRecord,
): Promise<PaymentTypeRecord> {
	const response = await ApiClient.post<ApiPaymentTypeSaveResponse>(
		PaymentTypeApiPath,
		toApiPaymentTypePayload(paymentType),
	);

	return mapApiPaymentType(response.data.paymentType);
}

export async function updatePaymentType(
	paymentType: PaymentTypeRecord,
): Promise<PaymentTypeRecord> {
	const response = await ApiClient.patch<ApiPaymentTypeSaveResponse>(
		`${PaymentTypeApiPath}/${paymentType.id}`,
		toApiPaymentTypePayload(paymentType),
	);

	return mapApiPaymentType(response.data.paymentType);
}

export async function importPaymentTypes(
	paymentTypes: PaymentTypeRecord[],
): Promise<PaymentTypeRecord[]> {
	const response = await ApiClient.post<ApiPaymentTypeImportResponse>(
		`${PaymentTypeApiPath}/import`,
		{
			paymentTypes: paymentTypes.map(toApiPaymentTypePayload),
		},
	);

	return response.data.paymentTypes.map(mapApiPaymentType);
}

export function applyPaymentTypeListParams(
	paymentTypes: PaymentTypeRecord[],
	params: PaymentTypeListParams = {},
) {
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
			const matchesStatus =
				!params.status || paymentType.status === params.status;

			return matchesSearch && matchesType && matchesStatus;
		})
		.sort((left, right) => {
			const result =
				sortBy === "sortOrder"
					? left.sortOrder - right.sortOrder
					: paymentTypeCollator.compare(left[sortBy], right[sortBy]);

			return sortDirection === "asc" ? result : -result;
		});
}

function mapApiPaymentType(paymentType: ApiPaymentType): PaymentTypeRecord {
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

function toApiPaymentTypePayload(paymentType: PaymentTypeRecord) {
	return {
		name: paymentType.paymentType.trim(),
		description: paymentType.description.trim(),
		classification: mapClassificationToApi(paymentType.type),
		sortOrder: paymentType.sortOrder,
		status: mapStatusToApi(paymentType.status),
	};
}

function toApiPaymentTypeListParams(params: PaymentTypeListParams) {
	return {
		search: params.search?.trim() || undefined,
		sortBy: mapSortKeyToApi(params.sortBy),
		sortDirection: params.sortDirection,
		status: params.status ? mapStatusToApi(params.status) : undefined,
		classification: params.type
			? mapClassificationToApi(params.type)
			: undefined,
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

function mapClassificationFromApi(
	value: ApiPaymentTypeClassification,
): PaymentTypeClassification {
	if (value === "CASH") return "Cash";
	if (value === "BANK_TRANSFER") return "Bank Transfer";
	if (value === "CHECK") return "Check";
	if (value === "DIGITAL_WALLET") return "Digital Wallet";
	return "Non-Cash Settlement";
}

function mapClassificationToApi(
	value: PaymentTypeClassification,
): ApiPaymentTypeClassification {
	if (value === "Cash") return "CASH";
	if (value === "Bank Transfer") return "BANK_TRANSFER";
	if (value === "Check") return "CHECK";
	if (value === "Digital Wallet") return "DIGITAL_WALLET";
	return "NON_CASH_SETTLEMENT";
}

function mapStatusFromApi(value: ApiPaymentTypeStatus): PaymentTypeStatus {
	return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: PaymentTypeStatus): ApiPaymentTypeStatus {
	return value === "Active" ? "ACTIVE" : "INACTIVE";
}


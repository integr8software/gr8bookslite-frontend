import { MockPaymentTypes } from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import type {
	PaymentTypeClassification,
	PaymentTypeRecord,
	PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export type PaymentTypeSortKey = "paymentType" | "type" | "status";

export type PaymentTypeListParams = {
	search?: string;
	sortBy?: PaymentTypeSortKey;
	sortDirection?: "asc" | "desc";
	status?: "" | PaymentTypeStatus;
	type?: "" | PaymentTypeClassification;
};

const paymentTypeCollator = new Intl.Collator(undefined, {
	numeric: true,
	sensitivity: "base",
});

export async function fetchPaymentTypes(
	params: PaymentTypeListParams = {},
): Promise<PaymentTypeRecord[]> {
	return applyPaymentTypeListParams(MockPaymentTypes, params);
}

export async function createPaymentType(
	paymentType: PaymentTypeRecord,
): Promise<PaymentTypeRecord> {
	return paymentType;
}

export async function updatePaymentType(
	paymentType: PaymentTypeRecord,
): Promise<PaymentTypeRecord> {
	return paymentType;
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
			const result = paymentTypeCollator.compare(left[sortBy], right[sortBy]);

			return sortDirection === "asc" ? result : -result;
		});
}

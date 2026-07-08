import type { PaymentTypeListParams } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export const PaymentTypeQueryKeys = {
	all: () => ["paymentType"],
	paymentTypes: (params?: PaymentTypeListParams) => [
		"paymentType",
		"paymentTypes",
		params ?? {},
	],
};

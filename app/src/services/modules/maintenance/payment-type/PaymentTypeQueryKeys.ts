import type { PaymentTypeListParams } from "@/app/src/services/modules/maintenance/payment-type/PaymentTypeService";

export const PaymentTypeQueryKeys = {
	all: () => ["paymentType"],
	paymentTypes: (params?: PaymentTypeListParams) => [
		"paymentType",
		"paymentTypes",
		params ?? {},
	],
};

import type { PaymentTypeListParams } from "@/app/src/services/modules/maintenance/financial-management/payment-type/PaymentTypeService";

export const PaymentTypeQueryKeys = {
	paymentTypes: (params?: PaymentTypeListParams) => [
		"paymentType",
		"paymentTypes",
		params ?? {},
	],
};

import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  PaymentTypeLookupOption,
  PaymentTypeLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeLookupTypes";

type PaymentTypeBackendResponse = {
  id: string;
  name: string;
  classification?: string;
  sortOrder?: number;
  status?: string;
  [key: string]: unknown;
};

export async function fetchPaymentTypeLookupOptions(
  query: PaymentTypeLookupQuery = {},
): Promise<PaymentTypeLookupOption[]> {
  const response = await ApiClient.get<{ paymentTypes: PaymentTypeBackendResponse[] }>(
    "/maintenance/payment-type-maintenance/options",
    { params: query },
  );

  return (response.data.paymentTypes ?? []).map(mapPaymentTypeToLookupOption);
}

function mapPaymentTypeToLookupOption(item: PaymentTypeBackendResponse): PaymentTypeLookupOption {
  return {
    ...item,
    name: item.name,
    label: item.name,
    value: item.id,
    description: item.classification ? `${item.classification}` : item.name,
    paymentTypeId: item.id,
  };
}

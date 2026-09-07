import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type PaymentTypeLookupOption = AppAdvancedDropdownOption & {
  paymentTypeId: string;
  name: string;
  classification?: string;
  sortOrder?: number;
  status?: string;
  [key: string]: unknown;
};

export type PaymentTypeLookupQuery = {
  classification?: string;
  search?: string;
};

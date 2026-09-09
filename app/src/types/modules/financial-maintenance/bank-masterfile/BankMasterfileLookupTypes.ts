import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type BankAccountLookupOption = AppAdvancedDropdownOption & {
  bankId: string;
  bankName: string;
  accountName: string;
  accountNumber?: string;
  maskedAccountNumber?: string;
  currencyCode?: string;
  status?: string;
  [key: string]: unknown;
};

export type BankAccountLookupQuery = {
  currencyCode?: string;
  search?: string;
};

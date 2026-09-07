import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type ChartOfAccountsLookupOption = AppAdvancedDropdownOption & {
  accountId: string;
  accountCode: string;
  accountTitle: string;
  accountType?: string;
  accountNature?: string;
  isPostingAccount?: boolean;
  [key: string]: unknown;
};

export type PostingAccountLookupOption = ChartOfAccountsLookupOption;

export type ChartOfAccountsLookupQuery = {
  accountLevel?: string;
  accountNature?: string;
  accountType?: string;
  parentAccountId?: string;
  postingOnly?: boolean;
  search?: string;
};

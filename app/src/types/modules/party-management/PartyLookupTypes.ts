import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type PartyLookupOptionAccountingAccount = {
  id?: string;
  accountCode?: string;
  accountTitle?: string;
} | null;

export type PartyLookupOption = AppAdvancedDropdownOption & {
  partyId: string;
  partyCode: string;
  partyName: string;
  partyTypes?: string[];
  classification?: string;
  contactPerson?: string;
  contactNo?: string;
  email?: string;
  tin?: string;
  cashAdvanceLimit?: string;
  cashAdvanceBalance?: string;
  defaultPurchaseInputVatTaxSourceKey?: string;
  defaultPurchaseEwtTaxSourceKey?: string;
  defaultPurchaseFwtTaxSourceKey?: string;
  defaultPurchaseWvatTaxSourceKey?: string;
  defaultSalesOutputVatTaxSourceKey?: string;
  defaultSalesCwtTaxSourceKey?: string;
  defaultSalesWvatTaxSourceKey?: string;
  defaultReceivableAccount?: string;
  customerAdvanceAccount?: string;
  defaultPayableAccount?: string;
  vendorAdvanceAccount?: string;
  employeeAdvanceAccount?: string;
  employeePayableAccount?: string;
  accountingAccounts?: {
    defaultReceivableAccount?: PartyLookupOptionAccountingAccount;
    customerAdvanceAccount?: PartyLookupOptionAccountingAccount;
    defaultPayableAccount?: PartyLookupOptionAccountingAccount;
    vendorAdvanceAccount?: PartyLookupOptionAccountingAccount;
    employeeAdvanceAccount?: PartyLookupOptionAccountingAccount;
    employeePayableAccount?: PartyLookupOptionAccountingAccount;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type PartyLookupQuery = {
  detail?: "complete" | "basic";
  partyType?: string;
  partyTypes?: string[];
  search?: string;
  status?: string;
};

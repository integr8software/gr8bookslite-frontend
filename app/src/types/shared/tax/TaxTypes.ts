import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type Tax = {
  id: string;
  sourceKey: string;
  transactionType: string;
  taxType: string;
  taxCode: string;
  taxDescription: string;
  taxExempt: boolean;
  taxRate: string;
  taxAlias: string | null;
  atc: string | null;
  officialAtcCode: string | null;
  natureOfIncome: string | null;
  sortOrder: number;
  status?: "ACTIVE" | "INACTIVE";
};

export type TaxListQuery = {
  limit?: number;
  officialAtcCode?: string;
  query?: string;
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  taxCode?: string;
  taxExempt?: boolean;
  taxType?: string;
  transactionType?: string;
};

export type PartyTaxDefaultClassificationKey =
  | "defaultPurchaseInputVatTaxSourceKey"
  | "defaultPurchaseEwtTaxSourceKey"
  | "defaultPurchaseFwtTaxSourceKey"
  | "defaultPurchaseWvatTaxSourceKey"
  | "defaultSalesOutputVatTaxSourceKey"
  | "defaultSalesCwtTaxSourceKey"
  | "defaultSalesWvatTaxSourceKey";

export type TaxDefaultClassification<TKey extends string = string> = {
  key: TKey;
  label: string;
  officialAtcCodePrefix?: string;
  taxTypes: string[];
  transactionType: string;
};

export type PartyTaxDefaultClassification = TaxDefaultClassification<PartyTaxDefaultClassificationKey>;

export type TaxDefaultOption = {
  code: string;
  defaultAccountCode?: string | null;
  defaultAccountRole?: string | null;
  defaultAccountTitle?: string | null;
  description: string;
  disabled?: boolean;
  label: string;
  name: string;
  selectedDetails: string;
  value: string;
};

export type PartyTaxDefaultOption = TaxDefaultOption;

export type PartyTaxDefaultOptions = Record<PartyTaxDefaultClassificationKey, PartyTaxDefaultOption[]>;

export type TaxDefaultAccountOptionClassification =
  | "output-sales"
  | "input-importation"
  | "input-purchases"
  | "input-all"
  | "purchase-ewt"
  | "purchase-fwt"
  | "purchase-wvat"
  | "sales-cwt"
  | "sales-wvat";

export type TaxDefaultAccountOption = {
  defaultAccountCode: string | null;
  defaultAccountRole: string | null;
  defaultAccountTitle: string | null;
  displayCode: string;
  natureOfIncome: string | null;
  sourceKey: string;
  status: string;
  sortOrder?: number;
  taxCode: string;
  taxDescription: string;
  taxExempt: boolean;
  taxRate: string;
  taxType: string;
  transactionType: string;
};

export type TaxDefaultAccountOptionGroup = {
  classification: TaxDefaultAccountOptionClassification;
  label: string;
  options: TaxDefaultAccountOption[];
};

export type TaxLookupOption = AppAdvancedDropdownOption & {
  taxId: string;
  taxCode: string;
  taxRate: string;
  taxType: string;
  transactionType: string;
  atc?: string | null;
  officialAtcCode?: string | null;
  taxExempt: boolean;
  rawTax: Tax;
  [key: string]: unknown;
};

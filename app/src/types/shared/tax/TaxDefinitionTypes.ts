import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";

export type TaxDefinitionTreatment =
  "STANDARD" | "REDUCED" | "ZERO_RATED" | "EXEMPT" | "OUT_OF_SCOPE";
export type TaxDefinitionTransactionScope = "SALE" | "PURCHASE" | "BOTH";

export type TaxDefinition = {
  id: string;
  name: string;
  percentage: string;
  sortOrder: number;
  treatment: TaxDefinitionTreatment;
  transactionScope: TaxDefinitionTransactionScope;
  status: "Active" | "Inactive";
};

export type TaxDefinitionDefaultAccountIds = {
  inputTaxAccountId: string;
  outputTaxAccountId: string;
  deferredTaxAccountId: string;
  expandedWithholdingTaxAccountId: string;
  creditableWithholdingTaxAccountId: string;
  withholdingVatableTaxAccountId: string;
  finalWithholdingTaxAccountId: string;
};

export type TaxDefinitionLookup = {
  taxDefinitions: TaxDefinition[];
  accountOptions: ModuleChartAccount[];
  defaultAccountIds: TaxDefinitionDefaultAccountIds;
};

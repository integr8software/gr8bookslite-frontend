import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  TaxDefinition,
  TaxDefinitionLookup,
} from "@/app/src/types/shared/tax/TaxDefinitionTypes";

const TaxDefinitionsApiPath = "/tax";

type ApiTaxDefinition = {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  treatment: TaxDefinition["treatment"];
  transactionScope: TaxDefinition["transactionScope"];
  status: "ACTIVE" | "INACTIVE";
};

type ApiTaxDefinitionLookup = {
  taxes: ApiTaxDefinition[];
  accountOptions: TaxDefinitionLookup["accountOptions"];
  defaultAccountIds: TaxDefinitionLookup["defaultAccountIds"];
};

export async function fetchTaxDefinitions(): Promise<TaxDefinitionLookup> {
  const response = await ApiClient.get<ApiTaxDefinitionLookup>(TaxDefinitionsApiPath, {
    params: { page: 1, limit: 500, sortBy: "sortOrder", sortDirection: "asc" },
  });

  return {
    taxDefinitions: response.data.taxes.map((tax) => ({
      id: tax.id,
      name: tax.name,
      percentage: String(Number(tax.percentage)),
      sortOrder: tax.sortOrder,
      treatment: tax.treatment,
      transactionScope: tax.transactionScope,
      status: tax.status === "ACTIVE" ? "Active" : "Inactive",
    })),
    accountOptions: response.data.accountOptions,
    defaultAccountIds: response.data.defaultAccountIds,
  };
}

export async function reorderTaxDefinitions(taxIds: string[]): Promise<void> {
  await ApiClient.patch(`${TaxDefinitionsApiPath}/reorder`, { taxIds });
}

import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { ApiTaxDefinitionLookup, TaxDefinitionLookup } from "@/app/src/types/shared/tax/TaxDefinitionTypes";

const TaxDefinitionsApiPath = "/tax";

export const TaxDefinitionQueryKeys = {
  all: (companyId?: number | null) => ["taxDefinitions", companyId ?? "no-company"] as const,
  lookup: (companyId?: number | null) => [...TaxDefinitionQueryKeys.all(companyId), QueryLookupScope] as const,
};

export async function fetchTaxDefinitions(): Promise<TaxDefinitionLookup> {
  const response = await ApiClient.get<ApiTaxDefinitionLookup>(TaxDefinitionsApiPath, {
    params: { page: 1, limit: 500, sortBy: "sortOrder", sortDirection: "asc" },
  });

  return {
    taxDefinitions: response.data.taxes.map((tax) => ({
      id: String(tax.id),
      name: tax.name?.trim() || "Unnamed tax",
      percentage: String(Number(tax.percentage ?? 0)),
      sortOrder: tax.sortOrder ?? 0,
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

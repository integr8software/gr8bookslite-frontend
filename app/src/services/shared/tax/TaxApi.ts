import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { PartyTaxDefaultClassificationResponse, TaxListQuery, TaxListResponse } from "@/app/src/types/shared/tax/TaxTypes";

const TaxesPath = "/tax";

export const TaxQueryKeys = {
  all: () => ["taxes"] as const,
  list: (query: TaxListQuery = {}) => ["taxes", "list", query] as const,
  partyDefaultClassifications: () => ["taxes", "partyDefaultClassifications"] as const,
};

export async function fetchTaxes(query: TaxListQuery = {}) {
  const response = await ApiClient.get<TaxListResponse>(TaxesPath, {
    params: query,
  });

  return response.data.taxCodes ?? response.data.taxes ?? [];
}

export async function fetchPartyTaxDefaultClassifications() {
  const response = await ApiClient.get<PartyTaxDefaultClassificationResponse>(`${TaxesPath}/party-default-classifications`);

  return response.data.classifications;
}

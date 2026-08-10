import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { AlphanumericTaxCodeListQuery, AlphanumericTaxCodeListResponse } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";

const AlphanumericTaxCodesPath = "/tax";

export const AlphanumericTaxCodeQueryKeys = {
  all: () => ["alphanumericTaxCodes"] as const,
  list: (query: AlphanumericTaxCodeListQuery = {}) => ["alphanumericTaxCodes", "list", query] as const,
};

export async function fetchAlphanumericTaxCodes(query: AlphanumericTaxCodeListQuery = {}) {
  const response = await ApiClient.get<AlphanumericTaxCodeListResponse>(AlphanumericTaxCodesPath, {
    params: query,
  });

  return response.data.taxCodes ?? response.data.taxes ?? [];
}

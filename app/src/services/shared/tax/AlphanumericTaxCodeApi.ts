import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  AlphanumericTaxCode,
  AlphanumericTaxCodeListQuery,
} from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";

const AlphanumericTaxCodesPath = "/tax";

export const AlphanumericTaxCodeQueryKeys = {
  all: () => ["alphanumericTaxCodes"] as const,
  list: (query: AlphanumericTaxCodeListQuery = {}) => ["alphanumericTaxCodes", "list", query] as const,
};

export async function fetchAlphanumericTaxCodes(query: AlphanumericTaxCodeListQuery = {}) {
  const response = await ApiClient.get<
    Partial<Record<"taxCodes" | "taxes", AlphanumericTaxCode[]>>
  >(AlphanumericTaxCodesPath, {
    params: query,
  });

  return response.data.taxCodes ?? response.data.taxes ?? [];
}

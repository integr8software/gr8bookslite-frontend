import { taxControllerListTaxesV1 } from "@/app/src/generated/api/tax/tax";
import type {
  AlphanumericTaxCode,
  AlphanumericTaxCodeListQuery,
} from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type { TaxResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export const AlphanumericTaxCodeQueryKeys = {
  all: () => ["alphanumericTaxCodes"] as const,
  list: (query: AlphanumericTaxCodeListQuery = {}) => ["alphanumericTaxCodes", "list", query] as const,
};

export async function fetchAlphanumericTaxCodes(query: AlphanumericTaxCodeListQuery = {}) {
  const response = await taxControllerListTaxesV1(query);

  return (response.taxCodes ?? response.taxes ?? []).map(mapGeneratedAlphanumericTaxCode);
}

function mapGeneratedAlphanumericTaxCode(tax: TaxResponseDto): AlphanumericTaxCode {
  return {
    ...tax,
    id: String(tax.id),
  };
}

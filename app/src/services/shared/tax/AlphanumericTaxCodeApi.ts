import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	AlphanumericTaxCode,
	AlphanumericTaxCodeListQuery,
} from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";

type AlphanumericTaxCodeListResponse = {
	taxCodes: AlphanumericTaxCode[];
};

const AlphanumericTaxCodesPath = "/alphanumeric-tax-codes";

export const AlphanumericTaxCodeQueryKeys = {
	all: () => ["alphanumericTaxCodes"] as const,
	list: (query: AlphanumericTaxCodeListQuery = {}) =>
		["alphanumericTaxCodes", "list", query] as const,
};

export async function fetchAlphanumericTaxCodes(
	query: AlphanumericTaxCodeListQuery = {},
) {
	const response = await ApiClient.get<AlphanumericTaxCodeListResponse>(
		AlphanumericTaxCodesPath,
		{
			params: query,
		},
	);

	return response.data.taxCodes;
}

import {
  taxControllerListPartyDefaultClassificationsV1,
  taxControllerListTaxDefaultAccountOptionsV1,
  taxControllerListTaxesV1,
} from "@/app/src/generated/api/tax/tax";
import type {
  PartyTaxDefaultClassification,
  Tax,
  TaxDefaultAccountOption,
  TaxDefaultAccountOptionClassification,
  TaxDefaultAccountOptionGroup,
  TaxListQuery,
} from "@/app/src/types/shared/tax/TaxTypes";
import type {
  TaxDefaultAccountOptionGroupResponseDto,
  TaxDefaultAccountOptionResponseDto,
  TaxResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export const TaxQueryKeys = {
  all: () => ["taxes"] as const,
  list: (query: TaxListQuery = {}) => ["taxes", "list", query] as const,
  defaultAccountOptions: (classification?: TaxDefaultAccountOptionClassification) =>
    ["taxes", "defaultAccountOptions", classification ?? "all"] as const,
  partyDefaultClassifications: () => ["taxes", "partyDefaultClassifications"] as const,
};

export async function fetchTaxes(query: TaxListQuery = {}) {
  const response = await taxControllerListTaxesV1(query);

  return (response.taxCodes ?? response.taxes ?? []).map(mapGeneratedTax);
}

export async function fetchPartyTaxDefaultClassifications() {
  const response = await taxControllerListPartyDefaultClassificationsV1();

  return response.classifications as PartyTaxDefaultClassification[];
}

export async function fetchTaxDefaultAccountOptionGroups(
  classification?: TaxDefaultAccountOptionClassification,
) {
  const response = await taxControllerListTaxDefaultAccountOptionsV1(
    classification ? { classification } : undefined,
  );

  return response.groups.map(mapGeneratedTaxDefaultAccountOptionGroup);
}

function mapGeneratedTax(tax: TaxResponseDto): Tax {
  return {
    ...tax,
    id: String(tax.id),
  };
}

function mapGeneratedTaxDefaultAccountOptionGroup(
  group: TaxDefaultAccountOptionGroupResponseDto,
): TaxDefaultAccountOptionGroup {
  return {
    classification: group.classification,
    label: group.label,
    options: group.options.map(mapGeneratedTaxDefaultAccountOption),
  };
}

function mapGeneratedTaxDefaultAccountOption(
  option: TaxDefaultAccountOptionResponseDto,
): TaxDefaultAccountOption {
  return {
    ...option,
  };
}

import { fetchTaxes } from "@/app/src/services/shared/tax/TaxApi";
import type { Tax, TaxListQuery, TaxLookupOption } from "@/app/src/types/shared/tax/TaxTypes";

export async function fetchTaxLookupOptions(query: TaxListQuery = {}): Promise<TaxLookupOption[]> {
  const taxes = await fetchTaxes({ status: "ACTIVE", ...query });

  return taxes.map(mapTaxToLookupOption);
}

export async function fetchPurchaseTaxLookupOptions(query: Omit<TaxListQuery, "transactionType"> = {}): Promise<TaxLookupOption[]> {
  return fetchTaxLookupOptions({ ...query, transactionType: "PURCHASE" });
}

export async function fetchSalesTaxLookupOptions(query: Omit<TaxListQuery, "transactionType"> = {}): Promise<TaxLookupOption[]> {
  return fetchTaxLookupOptions({ ...query, transactionType: "SALES" });
}

function mapTaxToLookupOption(tax: Tax): TaxLookupOption {
  const label = `${tax.taxCode} - ${tax.taxDescription} (${tax.taxRate}%)`;

  return {
    ...tax,
    name: label,
    label: tax.taxCode,
    value: tax.sourceKey || tax.taxCode,
    description: `${tax.taxDescription} - ${tax.taxRate}%`,
    taxId: tax.id,
    taxCode: tax.taxCode,
    taxRate: tax.taxRate,
    taxType: tax.taxType,
    transactionType: tax.transactionType,
    atc: tax.atc,
    officialAtcCode: tax.officialAtcCode,
    taxExempt: tax.taxExempt,
    rawTax: tax,
  };
}

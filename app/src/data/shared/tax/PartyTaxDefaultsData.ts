import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
} from "@/app/src/data/shared/tax/TaxData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";

const InputVatTaxType = "INPUT VAT";
const ExpandedWithholdingTaxType = "EWT";
const CreditableWithholdingTaxType = "CWT";

export type PartyTaxDefaults = {
  defaultPurchaseInputVatTaxSourceKey?: string;
  defaultPurchaseEwtTaxSourceKey?: string;
  vatCode?: string;
  vatType?: string;
  ewtCode?: string;
  [key: string]: unknown;
};

type PartyTaxOption = AppAdvancedDropdownOption & PartyTaxDefaults;

export function findPartyTaxCodeBySourceKey(
  taxCodes: AlphanumericTaxCode[],
  sourceKey: string | undefined,
  taxType: typeof ExpandedWithholdingTaxType | typeof InputVatTaxType,
) {
  if (!sourceKey) {
    return "";
  }

  const taxCode = taxCodes.find((tax) => {
    if (tax.sourceKey !== sourceKey) {
      return false;
    }

    if (taxType === InputVatTaxType) {
      return tax.taxType === InputVatTaxType || tax.taxType === "VAT";
    }

    return tax.taxType === ExpandedWithholdingTaxType || tax.taxType === CreditableWithholdingTaxType;
  });

  return taxCode ? (taxType === ExpandedWithholdingTaxType ? taxCode.officialAtcCode || taxCode.taxCode : taxCode.taxCode) : "";
}

export function getPartyDefaultVatCode(option: PartyTaxDefaults | undefined, taxCodes: AlphanumericTaxCode[]) {
  return option?.vatCode || findPartyTaxCodeBySourceKey(taxCodes, option?.defaultPurchaseInputVatTaxSourceKey, InputVatTaxType);
}

export function getPartyDefaultEwtCode(option: PartyTaxDefaults | undefined, taxCodes: AlphanumericTaxCode[]) {
  return (
    option?.ewtCode || findPartyTaxCodeBySourceKey(taxCodes, option?.defaultPurchaseEwtTaxSourceKey, ExpandedWithholdingTaxType)
  );
}

export function resolvePartyDefaultVatType(
  option: PartyTaxOption | undefined,
  fallback: string,
  vatOptions: AppAdvancedDropdownOption[],
  taxCodes: AlphanumericTaxCode[] = [],
) {
  const taxCode = getPartyDefaultVatCode(option, taxCodes);
  const rawValue = option?.vatType || taxCode || option?.defaultPurchaseInputVatTaxSourceKey || "";
  const normalized = normalizeTaxLookupValue(rawValue);
  const taxRate = taxCode ? getVatRateFromCode(taxCode, taxCodes) : "";
  const taxPercent = getVatPercentFromRate(taxRate);

  const matchedOption = vatOptions.find((vatOption) => {
    const values = [
      vatOption.value,
      vatOption.name,
      vatOption.label ?? "",
      vatOption.selectedDetails ?? "",
    ].map(normalizeTaxLookupValue);

    return (
      values.includes(normalized) ||
      (taxPercent > 0 && values.some((value) => value.includes(String(taxPercent)))) ||
      (normalized.includes("zero") && values.some((value) => value.includes("zero"))) ||
      (normalized.includes("exempt") && values.some((value) => value.includes("exempt"))) ||
      (normalized.includes("nonvat") && values.some((value) => value.includes("nonvat")))
    );
  });

  return matchedOption?.value ?? fallback;
}

export function resolvePartyDefaultEwtCode(
  option: PartyTaxOption | undefined,
  fallback: string,
  ewtOptions: AppAdvancedDropdownOption[],
  taxCodes: AlphanumericTaxCode[] = [],
) {
  const taxCode = getPartyDefaultEwtCode(option, taxCodes);
  const rawValue = taxCode || option?.defaultPurchaseEwtTaxSourceKey || "";
  const normalized = normalizeTaxLookupValue(rawValue);
  const taxPercent = taxCode ? getEwtPercentFromCode(taxCode, taxCodes) : 0;

  const matchedOption = ewtOptions.find((ewtOption) => {
    const values = [
      ewtOption.value,
      ewtOption.name,
      ewtOption.label ?? "",
      ewtOption.selectedDetails ?? "",
    ].map(normalizeTaxLookupValue);

    return (
      values.includes(normalized) ||
      values.some((value) => value.startsWith(normalized)) ||
      (taxPercent > 0 && values.some((value) => value.includes(String(taxPercent))))
    );
  });

  return matchedOption?.value ?? fallback;
}

function normalizeTaxLookupValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

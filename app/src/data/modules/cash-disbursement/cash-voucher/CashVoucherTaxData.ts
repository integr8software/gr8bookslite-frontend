import { createTaxDetails } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type { CashVoucherTaxDetails } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function getVatPercentFromRate(taxRate: string) {
  return createTaxDetails(0, taxRate).vatPercent;
}

export function getEwtPercentFromCode(value: string, taxCodes: AlphanumericTaxCode[]) {
  const row = taxCodes.find((item) => item.taxType === "EWT" && item.taxCode === value);
  if (row) return Number(row.taxRate);

  const percent = value.match(/(\d+(?:\.\d+)?)(?!.*\d)/);
  return percent ? Number.parseFloat(percent[1]) : 0;
}

export function getVatRateFromCode(vatCode: string, taxCodes: AlphanumericTaxCode[]) {
  if (!vatCode) return "0%";

  const row = taxCodes.find(
    (item) => item.transactionType === "Purchases" && item.taxType === "INPUT VAT" && item.taxCode === vatCode,
  );
  if (row) return `${row.taxRate}%`;
  if (vatCode === "VAT-5") return "5%";
  if (vatCode === "VAT-12") return "12%";
  return "0%";
}

export function normalizeVatDropdownValue(taxDetails: CashVoucherTaxDetails, taxCodes: AlphanumericTaxCode[]) {
  if (!taxDetails.vatCode) return "";
  if (taxCodes.some((row) => row.taxCode === taxDetails.vatCode)) return taxDetails.vatCode;

  return taxCodes.find(
    (row) =>
      row.transactionType === "Purchases" &&
      row.taxType === "INPUT VAT" &&
      Number(row.taxRate) === taxDetails.vatPercent,
  )?.taxCode ?? "";
}

export function createVatOptions(taxCodes: AlphanumericTaxCode[]): AppAdvancedDropdownOption[] {
  const options = new Map<string, AppAdvancedDropdownOption>();
  taxCodes
    .filter((row) => row.transactionType === "Purchases" && row.taxType === "INPUT VAT")
    .forEach((row) => {
      if (!options.has(row.taxCode)) {
        options.set(row.taxCode, { label: `${row.taxRate}%`, name: row.taxDescription, value: row.taxCode });
      }
    });
  return Array.from(options.values());
}

export function createEwtOptions(taxCodes: AlphanumericTaxCode[]): AppAdvancedDropdownOption[] {
  return taxCodes
    .filter((row) => row.transactionType === "Purchases" && row.taxType === "EWT")
    .map((row) => ({
      description: row.taxDescription,
      label: `${row.taxRate}%`,
      name: row.taxCode,
      value: row.taxCode,
    }));
}

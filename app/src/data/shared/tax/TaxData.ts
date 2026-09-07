import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type { TaxDefaultAccountOption } from "@/app/src/types/shared/tax/TaxTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export const PurchaseTaxTypeInputVat = "INPUT VAT";
export const PurchaseTaxTypeVat = "VAT";
export const PurchaseTaxTypeEwt = "EWT";
export const PurchaseTaxTypeCwt = "CWT";

export function FormatTinNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const formattedGroups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9, 12)].filter(Boolean);

  return formattedGroups.join("-");
}

export function parsePercentage(value: string | number): number {
  if (typeof value === "number") return value;
  const clean = String(value).trim();
  if (/^[A-Za-z]{2,}\s*\d{2,}/.test(clean)) {
    return 0;
  }
  const match = clean.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) return Number.parseFloat(match[1]);
  if (/^\d+(\.\d+)?$/.test(clean)) {
    const parsed = Number.parseFloat(clean);
    return parsed <= 100 ? parsed : 0;
  }
  return 0;
}

export function calculateTaxAmounts({
  grossAmount,
  taxRate = "0%",
  ewtRate = "0%",
  isVatInclusive = true,
}: {
  grossAmount: number;
  taxRate?: string | number;
  ewtRate?: string | number;
  isVatInclusive?: boolean;
}) {
  const vatPercent = typeof taxRate === "number" ? taxRate : parsePercentage(taxRate);
  const ewtPercent = typeof ewtRate === "number" ? ewtRate : parsePercentage(ewtRate);

  const vatAmount =
    vatPercent > 0 ? (isVatInclusive ? grossAmount - grossAmount / (1 + vatPercent / 100) : grossAmount * (vatPercent / 100)) : 0;

  const netAmount = grossAmount - vatAmount;
  const ewtAmount = ewtPercent > 0 ? netAmount * (ewtPercent / 100) : 0;
  const totalAmountDue = netAmount + vatAmount - ewtAmount;

  return {
    vatPercent,
    vatAmount,
    netAmount,
    ewtPercent,
    ewtAmount,
    totalAmountDue,
  };
}

export function getVatPercentFromRate(taxRate: string): number {
  return parsePercentage(taxRate);
}

export function getEwtPercentFromCode(value: string, taxCodes: AlphanumericTaxCode[]): number {
  if (!value) return 0;
  const clean = value.trim();
  const normalized = clean.toUpperCase().replace(/\s+/g, "");

  const row =
    taxCodes.find((item) => {
      const itemCode = (item.taxCode || "").toUpperCase().replace(/\s+/g, "");
      const itemAtc = (item.officialAtcCode || item.atc || "").toUpperCase().replace(/\s+/g, "");
      const matchesCode = itemCode === normalized || itemAtc === normalized;
      const isWithholding =
        !item.taxType ||
        item.taxType === PurchaseTaxTypeEwt ||
        item.taxType === PurchaseTaxTypeCwt ||
        item.taxType.includes("WITHHOLDING") ||
        item.taxType.includes("WT");
      return matchesCode && isWithholding;
    }) ??
    taxCodes.find((item) => {
      const itemCode = (item.taxCode || "").toUpperCase().replace(/\s+/g, "");
      const itemAtc = (item.officialAtcCode || item.atc || "").toUpperCase().replace(/\s+/g, "");
      return itemCode === normalized || itemAtc === normalized;
    });

  if (row && row.taxRate != null) {
    const parsed = Number.parseFloat(String(row.taxRate).replace(/[^0-9.]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) {
      return parsed;
    }
  }

  const knownAtcRates: Record<string, number> = {
    MC021: 0,
    WB030: 3,
    WB040: 2,
    WB050: 3,
    WB070: 5,
    WI650: 1,
    WC650: 1,
    WI158: 2,
    WC158: 2,
    WI010: 5,
    WC010: 5,
    WI020: 10,
    WC020: 10,
    WI100: 5,
    WC100: 5,
    WI140: 1,
    WC140: 1,
    WI157: 1,
    WC157: 1,
    WI160: 2,
    WC160: 2,
    W10: 10,
    W05: 5,
    W5: 5,
    WV01: 1,
    WV02: 2,
  };
  if (knownAtcRates[normalized] !== undefined) {
    return knownAtcRates[normalized];
  }

  return parsePercentage(value);
}

export function getVatRateFromCode(vatCode: string, taxCodes: AlphanumericTaxCode[]): string {
  if (!vatCode) return "0%";

  const row = taxCodes.find(
    (item) => item.transactionType === "Purchases" && item.taxType === PurchaseTaxTypeInputVat && item.taxCode === vatCode,
  );
  if (row) return `${row.taxRate}%`;
  if (vatCode === "VAT-5") return "5%";
  if (vatCode === "VAT-12") return "12%";
  return "0%";
}

export function normalizeVatDropdownValue(taxDetails: { vatCode?: string; vatPercent?: number }, taxCodes: AlphanumericTaxCode[]): string {
  if (!taxDetails.vatCode) return "";
  if (taxCodes.some((row) => row.taxCode === taxDetails.vatCode)) return taxDetails.vatCode;

  return (
    taxCodes.find(
      (row) =>
        row.transactionType === "Purchases" && row.taxType === PurchaseTaxTypeInputVat && Number(row.taxRate) === taxDetails.vatPercent,
    )?.taxCode ?? ""
  );
}

export function createVatOptions(taxCodes: AlphanumericTaxCode[], transactionType = "Purchases"): AppAdvancedDropdownOption[] {
  const options = new Map<string, AppAdvancedDropdownOption>();
  taxCodes
    .filter((row) => {
      const taxType = (row.taxType || "").toUpperCase();
      const isVat = taxType === PurchaseTaxTypeInputVat || taxType === PurchaseTaxTypeVat || taxType.includes("VAT");
      if (!isVat) return false;
      if (!transactionType) return true;
      const transType = (row.transactionType || "").toLowerCase();
      const targetTrans = transactionType.toLowerCase();
      return !row.transactionType || transType === targetTrans || transType.includes("purchase") || transType.includes("disbursement");
    })
    .forEach((row) => {
      if (!options.has(row.taxCode)) {
        const rawName = row.taxDescription || row.taxCode;
        const rate = row.taxRate != null && row.taxRate !== "" ? `${row.taxRate}%`.replace(/%%+/, "%") : "";
        const cleanName = rawName.replace(/\s*\(?\d+(?:\.\d+)?%\)?\s*$/u, "").trim();
        const name = rate ? `${cleanName} (${rate})` : cleanName;

        options.set(row.taxCode, {
          description: "",
          label: "",
          name,
          selectedDetails: "",
          value: row.taxCode,
        });
      }
    });

  return Array.from(options.values());
}

export function createEwtOptions(taxCodes: AlphanumericTaxCode[], transactionType = "Purchases"): AppAdvancedDropdownOption[] {
  const filtered = taxCodes.filter((row) => {
    const transType = (row.transactionType || "").toLowerCase();
    const targetTrans = transactionType.toLowerCase();
    const matchesTrans =
      !row.transactionType || transType === targetTrans || transType.includes("purchase") || transType.includes("disbursement");
    const taxType = (row.taxType || "").toUpperCase();
    const isEwt =
      taxType === PurchaseTaxTypeEwt || taxType === PurchaseTaxTypeCwt || taxType.includes("WITHHOLDING") || taxType.includes("WT");
    return matchesTrans && isEwt;
  });

  const options = new Map<string, AppAdvancedDropdownOption>();

  filtered.forEach((row) => {
    const displayCode = row.officialAtcCode || row.taxCode;
    if (options.has(displayCode)) return;

    const rate = row.taxRate != null && row.taxRate !== "" ? `${row.taxRate}%`.replace(/%%+/, "%") : "";
    const codeRateName = [displayCode, rate ? `(${rate})` : ""].filter(Boolean).join(" ");
    const rawDescription =
      row.natureOfIncome?.trim() || row.taxDescription.replace(/^[A-Z]{1,3}\s?\d{0,3}(?:\.\d+)?\s*\|\s*/, "").trim() || row.taxDescription;
    const description = rawDescription.replace(/\s*\(?\d+(?:\.\d+)?%\)?\s*$/u, "").trim();

    options.set(displayCode, {
      description,
      label: "",
      name: codeRateName,
      selectedDetails: "",
      value: displayCode,
    });
  });

  return Array.from(options.values());
}

export function createVatOptionsFromDefaultAccounts(taxOptions: TaxDefaultAccountOption[]): AppAdvancedDropdownOption[] {
  const options = new Map<string, AppAdvancedDropdownOption>();

  taxOptions.forEach((taxOption) => {
    if (options.has(taxOption.taxCode)) return;

    const rate = taxOption.taxRate != null && taxOption.taxRate !== "" ? `${taxOption.taxRate}%`.replace(/%%+/, "%") : "";
    const cleanName = taxOption.taxDescription.replace(/\s*\(?\d+(?:\.\d+)?%\)?\s*$/u, "").trim();
    const name = rate && !taxOption.taxExempt ? `${cleanName} (${rate})` : cleanName;

    options.set(taxOption.taxCode, {
      accountCode: taxOption.defaultAccountCode ?? undefined,
      accountTitle: taxOption.defaultAccountTitle ?? undefined,
      defaultAccountCode: taxOption.defaultAccountCode ?? undefined,
      defaultAccountRole: taxOption.defaultAccountRole ?? undefined,
      defaultAccountTitle: taxOption.defaultAccountTitle ?? undefined,
      description: taxOption.defaultAccountTitle ?? "",
      label: "",
      name,
      selectedDetails: taxOption.defaultAccountTitle ?? "",
      sourceKey: taxOption.sourceKey,
      taxCode: taxOption.taxCode,
      value: taxOption.taxCode,
    });
  });

  return Array.from(options.values());
}

export function createEwtOptionsFromDefaultAccounts(taxOptions: TaxDefaultAccountOption[]): AppAdvancedDropdownOption[] {
  const options = new Map<string, AppAdvancedDropdownOption>();

  taxOptions.forEach((taxOption) => {
    const displayCode = taxOption.displayCode || taxOption.taxCode;
    if (options.has(displayCode)) return;

    const rate = taxOption.taxRate != null && taxOption.taxRate !== "" ? `${taxOption.taxRate}%`.replace(/%%+/, "%") : "";
    const name = [displayCode, rate ? `(${rate})` : ""].filter(Boolean).join(" ");
    const description =
      taxOption.natureOfIncome?.trim() ||
      taxOption.taxDescription.replace(/^[A-Z]{1,3}\s?\d{0,3}(?:\.\d+)?\s*\|\s*/, "").trim() ||
      taxOption.taxDescription;

    options.set(displayCode, {
      accountCode: taxOption.defaultAccountCode ?? undefined,
      accountTitle: taxOption.defaultAccountTitle ?? undefined,
      defaultAccountCode: taxOption.defaultAccountCode ?? undefined,
      defaultAccountRole: taxOption.defaultAccountRole ?? undefined,
      defaultAccountTitle: taxOption.defaultAccountTitle ?? undefined,
      description,
      label: taxOption.defaultAccountTitle ?? "",
      name,
      selectedDetails: taxOption.defaultAccountTitle ?? "",
      sourceKey: taxOption.sourceKey,
      taxCode: taxOption.taxCode,
      value: displayCode,
    });
  });

  return Array.from(options.values());
}

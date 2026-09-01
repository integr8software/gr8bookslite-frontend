import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
  getPettyCashVoucherEwtPercent,
  getPettyCashVoucherEwtRate,
  PettyCashVoucherDefaultFormStatus,
  PettyCashVoucherDefaultVATable,
  PettyCashVoucherDefaultVatType,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import {
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
} from "@/app/src/data/shared/tax/TaxData";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";

import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export const PettyCashVoucherInitialFormValues: PettyCashVoucherFormValues = {
  accountCode: "",
  accountTitle: "",
  amount: "",
  attachments: [],
  documentDate: todayDateValue(),
  currency: "PHP",
  exchangeRate: "1.00",
  ewtCode: "",
  ewtRate: "0.00%",
  ewtAmount: "",
  netAmount: "",
  remarks: "",
  responsibilityCenter: "",
  responsibilityCenterCode: "",
  status: PettyCashVoucherDefaultFormStatus,
  transactionNo: "",
  vatType: PettyCashVoucherDefaultVatType,
  vatable: PettyCashVoucherDefaultVATable,
  vatRate: "0.00%",
  vatAmount: "",
  partyCode: "",
  partyName: "",
};

export function createPettyCashVoucherInitialFormValues(baseCurrencyCode = "PHP"): PettyCashVoucherFormValues {
  return {
    ...PettyCashVoucherInitialFormValues,
    currency: baseCurrencyCode,
    transactionNo: "",
  };
}

export function createPettyCashVoucherFormValues(
  record?: PettyCashVoucherRecord,
  transactionNo = "",
  baseCurrencyCode = "PHP",
  taxCodes: AlphanumericTaxCode[] = [],
): PettyCashVoucherFormValues {
  if (!record) {
    return {
      ...PettyCashVoucherInitialFormValues,
      currency: baseCurrencyCode,
      transactionNo,
    };
  }

  const amount = formatMoneyNumberDisplayValue(String(record.amount));
  const vatType = record.vatType ?? (record.vatable === "True" ? "VAT-12" : "");
  const ewtCode = record.ewtCode ?? "";
  const taxes = calculatePettyCashVoucherTaxFields(amount, vatType, ewtCode, taxCodes);

  return {
    ...PettyCashVoucherInitialFormValues,
    accountCode: record.accountCode,
    accountTitle: record.accountTitle,
    amount,
    documentDate: record.documentDate,
    currency: record.currency ?? "PHP",
    exchangeRate: record.exchangeRate ?? "1.00",
    ewtCode,
    ewtRate: record.ewtRate ?? taxes.ewtRate,
    ewtAmount: record.ewtAmount !== undefined ? formatPettyCashVoucherAmount(record.ewtAmount) : taxes.ewtAmount,
    netAmount: record.netAmount !== undefined ? formatPettyCashVoucherAmount(record.netAmount) : taxes.netAmount,
    remarks: record.remarks,
    status: record.status,
    transactionNo: record.voucherNo,
    vatType,
    vatable: record.vatable ?? (vatType ? "True" : "False"),
    vatRate: record.vatRate ?? taxes.vatRate,
    vatAmount: record.vatAmount !== undefined ? formatPettyCashVoucherAmount(record.vatAmount) : taxes.vatAmount,
    partyCode: record.partyCode,
    partyName: record.partyName,
  };
}

export function createPettyCashVoucherRecord(
  values: PettyCashVoucherFormValues,
  status: PettyCashVoucherStatus,
  existingRecord?: PettyCashVoucherRecord,
): PettyCashVoucherRecord {
  const updatedAt = new Date().toISOString();
  const amount = parseMoneyNumberInput(values.amount);
  const vatAmount = parseMoneyNumberInput(values.vatAmount);
  const ewtAmount = parseMoneyNumberInput(values.ewtAmount);
  const netAmount = parseMoneyNumberInput(values.netAmount);

  return {
    accountCode: values.accountCode.trim(),
    accountTitle: values.accountTitle.trim(),
    amount,
    disburseAmount: netAmount,
    createdBy: existingRecord?.createdBy ?? "Current User",
    dateCreated: existingRecord?.dateCreated ?? updatedAt,
    dateModified: updatedAt,
    documentDate: values.documentDate,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    ewtCode: values.ewtCode.trim(),
    ewtRate: values.ewtRate || getPettyCashVoucherEwtRate(values.ewtCode),
    ewtAmount,
    id: existingRecord?.id ?? `pcv-${values.transactionNo.toLowerCase()}`,
    netAmount,
    partyCode: values.partyCode.trim(),
    partyName: values.partyName.trim(),
    remarks: values.remarks.trim(),
    status,
    updatedBy: "Current User",
    vatType: values.vatType,
    vatable: values.vatable ?? (values.vatType ? "True" : "False"),
    vatRate: values.vatRate,
    vatAmount,
    voucherNo: values.transactionNo.trim(),
  };
}

export function calculatePettyCashVoucherTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
  taxCodes: AlphanumericTaxCode[] = [],
  customEwtPercent?: number,
) {
  const amount = parseMoneyNumberInput(amountValue);

  // VAT calculation:
  let vatPercent = 0;
  if (vatType) {
    const vatRateStr = getVatRateFromCode(vatType, taxCodes);
    vatPercent = getVatPercentFromRate(vatRateStr);
    if (vatPercent === 0 && (vatType === "VAT-12" || vatType === "V12" || vatType === "True")) {
      vatPercent = 12;
    }
  }
  const vatAmount = (amount * vatPercent) / 100;

  // EWT calculation:
  let ewtPercent = 0;
  if (customEwtPercent !== undefined) {
    ewtPercent = customEwtPercent;
  } else if (ewtCode) {
    ewtPercent = getEwtPercentFromCode(ewtCode, taxCodes);
    if (ewtPercent === 0) {
      ewtPercent = getPettyCashVoucherEwtPercent(ewtCode);
    }
  }

  const ewtAmount = (amount * ewtPercent) / 100;
  const netAmount = Math.max(amount - vatAmount - ewtAmount, 0);

  return {
    ewtAmount: formatPettyCashVoucherAmount(ewtAmount),
    ewtRate: ewtPercent > 0 ? `${ewtPercent.toFixed(2)}%` : "0.00%",
    netAmount: formatPettyCashVoucherAmount(netAmount),
    vatAmount: formatPettyCashVoucherAmount(vatAmount),
    vatRate: vatPercent > 0 ? `${vatPercent.toFixed(2)}%` : "0.00%",
  };
}

export function calculatePettyCashVoucherVatFields(
  amountValue: string,
  vatType = "",
  ewtCode = "",
  taxCodes: AlphanumericTaxCode[] = [],
) {
  return calculatePettyCashVoucherTaxFields(amountValue, vatType, ewtCode, taxCodes);
}

export function createPettyCashVoucherPartyOptions(values: PettyCashVoucherFormValues): AppAdvancedDropdownOption[] {
  return includeCurrentOption([], {
    label: values.partyCode,
    name: values.partyName,
    value: values.partyCode,
  });
}

export function createPettyCashVoucherAccountOptions(values: PettyCashVoucherFormValues): AppAdvancedDropdownOption[] {
  return includeCurrentOption([], {
    label: values.accountCode,
    name: values.accountTitle,
    value: values.accountTitle,
  });
}

export function createPettyCashVoucherResponsibilityCenterOptions(values: PettyCashVoucherFormValues): AppAdvancedDropdownOption[] {
  return includeCurrentOption([], {
    label: values.responsibilityCenterCode,
    name: values.responsibilityCenter,
    value: values.responsibilityCenterCode,
  });
}

function includeCurrentOption(options: AppAdvancedDropdownOption[], currentOption: AppAdvancedDropdownOption) {
  if (!currentOption.value || !currentOption.name) {
    return options;
  }

  if (options.some((option) => option.value === currentOption.value)) {
    return options;
  }

  return [...options, currentOption];
}

function formatPettyCashVoucherAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}


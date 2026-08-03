import {
  formatAccountsPayableVoucherAmount,
  getAccountsPayableVoucherAccountingTotals,
  getAccountsPayableVoucherExpenseTotals,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherFormValues,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

export function getAccountsPayableVoucherReportTotals(
  values: AccountsPayableVoucherFormValues,
) {
  const expenseTotals = getAccountsPayableVoucherExpenseTotals(
    values.expenseLines,
  );
  const accountingTotals = getAccountsPayableVoucherAccountingTotals(
    values.accountingEntries,
  );

  return {
    ...expenseTotals,
    ...accountingTotals,
    voucherAmount: Math.max(
      Number(values.amount || 0),
      expenseTotals.totalAmountDue,
      accountingTotals.totalDebit,
      accountingTotals.totalCredit,
    ),
  };
}

export function formatAccountsPayableVoucherReportAmount(value: number) {
  return formatAccountsPayableVoucherAmount(Number(value || 0));
}

export function formatAccountsPayableVoucherReportAccount(
  accountCode: string,
  accountTitle: string,
) {
  if (accountCode && accountTitle) {
    return `${accountCode} - ${accountTitle}`;
  }

  return accountCode || accountTitle || "-";
}

export function formatAccountsPayableVoucherReportDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatAccountsPayableVoucherAmountInWords(
  amount: number,
  currencyCode: string,
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "-";
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const wholeAmount = Math.floor(roundedAmount);
  const fractionalAmount = Math.round((roundedAmount - wholeAmount) * 100);
  const amountWords = toTitleCase(numberToWords(wholeAmount));
  const currencyLabel = getCurrencyUnitLabel(currencyCode);

  if (fractionalAmount > 0) {
    return `${amountWords} ${currencyLabel} And ${fractionalAmount}/100 Only`;
  }

  return `${amountWords} ${currencyLabel} Only`;
}

export function getAccountsPayableVoucherEntryPartyLabel(
  entry: AccountsPayableVoucherAccountingEntry,
  values: AccountsPayableVoucherFormValues,
) {
  return entry.partyName || entry.partyCode || values.partyName || "-";
}

function getCurrencyUnitLabel(currencyCode: string) {
  const normalizedCode = currencyCode.trim().toUpperCase();

  if (normalizedCode === "PHP") {
    return "Pesos";
  }

  if (normalizedCode === "USD") {
    return "US Dollars";
  }

  if (normalizedCode === "EUR") {
    return "Euros";
  }

  if (normalizedCode === "JPY") {
    return "Yen";
  }

  return normalizedCode || "Currency";
}

function numberToWords(value: number): string {
  if (value === 0) {
    return "zero";
  }

  const units = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const scales = ["", "thousand", "million", "billion"];
  const chunks: string[] = [];
  let remaining = Math.floor(value);
  let scaleIndex = 0;

  while (remaining > 0) {
    const chunk = remaining % 1000;

    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk, units, tens);
      const scale = scales[scaleIndex];

      chunks.unshift(scale ? `${chunkWords} ${scale}` : chunkWords);
    }

    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return chunks.join(" ");
}

function convertHundreds(value: number, units: string[], tens: string[]) {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  if (hundreds > 0) {
    words.push(`${units[hundreds]} hundred`);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      words.push(units[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const unit = remainder % 10;

      words.push(unit ? `${tens[ten]} ${units[unit]}` : tens[ten]);
    }
  }

  return words.join(" ");
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

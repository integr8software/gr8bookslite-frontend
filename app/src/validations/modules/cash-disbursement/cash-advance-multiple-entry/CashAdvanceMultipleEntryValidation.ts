import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { CashAdvanceMultipleEntryStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import type {
  CashAdvanceMultipleEntryFormErrors,
  CashAdvanceMultipleEntryFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { formatAmount } from "@/app/src/utils/currency.util";

const CashAdvanceMultipleEntryDraftSchema = z.object({
  documentDate: z.string().trim().min(1, "Select a CAME Date."),
  transNo: z.string().trim().min(1, "CAME No. is required."),
});

const CashAdvanceMultipleEntrySchema = z.object({
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.string().trim().min(1, "Default Account Title is required."),
  currency: z.string().trim().min(1, "Currency is required."),
  documentDate: z.string().trim().min(1, "Select a CAME Date."),
  exchangeRate: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Exchange Rate must be greater than zero."),
  partyCode: z.string().trim().min(1, "Employee Code is required."),
  partyName: z.string().trim().min(1, "Employee Name is required."),
  transNo: z.string().trim().min(1, "CAME No. is required."),
});

export function validateCashAdvanceMultipleEntryForm(values: CashAdvanceMultipleEntryFormValues): CashAdvanceMultipleEntryFormErrors {
  const isDraft = values.status === CashAdvanceMultipleEntryStatuses.draft;
  const result = (isDraft ? CashAdvanceMultipleEntryDraftSchema : CashAdvanceMultipleEntrySchema).safeParse(values);
  const errors: CashAdvanceMultipleEntryFormErrors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !errors[field as keyof CashAdvanceMultipleEntryFormErrors]) {
        errors[field as keyof CashAdvanceMultipleEntryFormErrors] = issue.message;
      }
    }
  }

  if (isDraft) {
    return errors;
  }

  const selectedEmployeeKeys = values.items
    .map((item) => (item.partyCode.trim() || item.partyName.trim()).toLowerCase())
    .filter(Boolean);

  if (new Set(selectedEmployeeKeys).size !== selectedEmployeeKeys.length) {
    errors.items = "Employee Name cannot be duplicated.";
  }

  const hasAmountLine = values.items.some((item) => parseMoneyNumberInput(item.amount) > 0);

  if (!hasAmountLine) {
    errors.items = errors.items ?? "Add at least one Cash Advance Amount.";
  }

  return errors;
}

export function getCashAdvanceMultipleEntryAvailabilityWarning(values: CashAdvanceMultipleEntryFormValues): string | null {
  const balances = new Map<string, { balance: number; partyName: string }>();
  const totals = new Map<string, number>();

  values.items.forEach((item) => {
    const partyKey = item.partyCode.trim() || item.partyName.trim() || item.id;
    totals.set(partyKey, (totals.get(partyKey) ?? 0) + parseMoneyNumberInput(item.amount));

    if (!item.cashAdvanceBalance.trim()) {
      return;
    }

    const balance = parseMoneyNumberInput(item.cashAdvanceBalance);
    const current = balances.get(partyKey);

    if (!current || balance < current.balance) {
      balances.set(partyKey, {
        balance,
        partyName: item.partyName.trim() || item.partyCode.trim() || "the selected employee",
      });
    }
  });

  const warnings: string[] = [];

  for (const [partyKey, { balance, partyName }] of balances) {
    const total = totals.get(partyKey) ?? 0;
    if (total > balance) {
      warnings.push(`Total Cash Advance Amount for ${partyName} cannot exceed the Available Cash Advance of ${formatAmount(balance)}.`);
    }
  }

  return warnings.length > 0 ? warnings.join(" ") : null;
}

export function validateCashAdvanceMultipleEntryAmountsWithinBalances(values: CashAdvanceMultipleEntryFormValues) {
  const warning = getCashAdvanceMultipleEntryAvailabilityWarning(values);
  if (warning) {
    return {
      isValid: false,
      message: warning,
    };
  }

  return { isValid: true, message: null };
}

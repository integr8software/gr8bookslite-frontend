import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceFormErrors,
  CashAdvanceFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

const CashAdvanceDraftSchema = z.object({
  documentDate: z.string().trim().min(1, "Select a CA Date."),
  transNo: z.string().trim().min(1, "CA No. is required."),
});

const CashAdvanceSchema = z.object({
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.string().trim().min(1, "Default Account Title is required."),
  currency: z.string().trim().min(1, "Currency is required."),
  documentDate: z.string().trim().min(1, "Select a CA Date."),
  exchangeRate: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Exchange Rate must be greater than zero."),
  partyCode: z.string().trim().min(1, "Employee Code is required."),
  partyName: z.string().trim().min(1, "Employee Name is required."),
  transNo: z.string().trim().min(1, "CA No. is required."),
});

export function validateCashAdvanceForm(values: CashAdvanceFormValues): CashAdvanceFormErrors {
  const isDraft = values.status === CashAdvanceStatuses.Draft;
  const result = (isDraft ? CashAdvanceDraftSchema : CashAdvanceSchema).safeParse(values);
  const errors: CashAdvanceFormErrors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !errors[field as keyof CashAdvanceFormErrors]) {
        errors[field as keyof CashAdvanceFormErrors] = issue.message;
      }
    }
  }

  if (isDraft) {
    return errors;
  }

  const selectedEmployeeKeys = (values.items || [])
    .map((item) => (item.partyCode.trim() || item.partyName.trim()).toLowerCase())
    .filter(Boolean);

  if (new Set(selectedEmployeeKeys).size !== selectedEmployeeKeys.length) {
    errors.items = "Employee Name cannot be duplicated.";
  }

  const hasAmountLine = (values.items || []).some((item) => parseMoneyNumberInput(item.amount) > 0);

  if (!hasAmountLine) {
    errors.items = errors.items ?? "Add at least one Cash Advance Amount.";
  }

  return errors;
}

export function getCashAdvanceAvailabilityWarning(values: CashAdvanceFormValues): string | null {
  const balances = new Map<string, number>();
  const totals = new Map<string, number>();

  (values.items || []).forEach((item) => {
    const partyKey = item.partyCode.trim() || item.partyName.trim() || item.id;
    totals.set(partyKey, (totals.get(partyKey) ?? 0) + parseMoneyNumberInput(item.amount));

    if (!item.cashAdvanceBalance.trim()) {
      return;
    }

    const balance = parseMoneyNumberInput(item.cashAdvanceBalance);
    const current = balances.get(partyKey);

    if (current === undefined || balance < current) {
      balances.set(partyKey, balance);
    }
  });

  let exceededEmployeeCount = 0;

  for (const [partyKey, balance] of balances) {
    const total = totals.get(partyKey) ?? 0;
    if (total > balance) {
      exceededEmployeeCount += 1;
    }
  }

  if (exceededEmployeeCount === 1) {
    return "An employee has a Total Cash Advance Amount that exceeds the Available Cash Advance.";
  }

  if (exceededEmployeeCount > 1) {
    return `Total Cash Advance Amount exceeds the Available Cash Advance for ${exceededEmployeeCount} employees.`;
  }

  return null;
}

export function validateCashAdvanceAmountsWithinBalances(values: CashAdvanceFormValues) {
  const warning = getCashAdvanceAvailabilityWarning(values);
  if (warning) {
    return {
      isValid: false,
      message: warning,
    };
  }

  return { isValid: true, message: null };
}

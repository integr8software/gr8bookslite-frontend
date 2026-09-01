import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { CashAdvanceMultipleEntryStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import type { CashAdvanceMultipleEntryFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { formatAmount } from "@/app/src/utils/currency.util";

const CashAdvanceMultipleEntryDraftSchema = z.object({
  documentDate: z.string().trim().min(1, "CAME Date is required."),
  transNo: z.string().trim().min(1, "CAME No. is required."),
});

const CashAdvanceMultipleEntrySchema = z.object({
  accountCode: z.string().trim().min(1, "Default Account is required."),
  currency: z.string().trim().min(1, "Currency is required."),
  documentDate: z.string().trim().min(1, "CAME Date is required."),
  exchangeRate: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Exchange Rate must be greater than zero."),
  items: z.array(
    z.object({
      amount: z.string().trim(),
      partyName: z.string().trim(),
    }),
  ),
  partyCode: z.string().trim().min(1, "Employee Code is required."),
  partyName: z.string().trim().min(1, "Employee Name is required."),
  transNo: z.string().trim().min(1, "CAME No. is required."),
});

export function validateCashAdvanceMultipleEntryForm(values: CashAdvanceMultipleEntryFormValues) {
  const isDraft = values.status === CashAdvanceMultipleEntryStatuses.draft;
  const result = (isDraft ? CashAdvanceMultipleEntryDraftSchema : CashAdvanceMultipleEntrySchema).safeParse(values);

  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message ?? "Review the Cash Advance Multiple Entry details.",
    };
  }

  if (isDraft) {
    return { isValid: true, message: null };
  }

  const selectedEmployeeKeys = values.items
    .map((item) => (item.partyCode.trim() || item.partyName.trim()).toLowerCase())
    .filter(Boolean);

  if (new Set(selectedEmployeeKeys).size !== selectedEmployeeKeys.length) {
    return {
      isValid: false,
      message: "Employee Name cannot be duplicated.",
    };
  }

  const hasAmountLine = values.items.some((item) => parseMoneyNumberInput(item.amount) > 0);

  if (!hasAmountLine) {
    return {
      isValid: false,
      message: "Add at least one Cash Advance Amount.",
    };
  }

  return validateCashAdvanceMultipleEntryAmountsWithinBalances(values);
}

export function validateCashAdvanceMultipleEntryAmountsWithinBalances(values: CashAdvanceMultipleEntryFormValues) {
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

  for (const [partyKey, { balance, partyName }] of balances) {
    if ((totals.get(partyKey) ?? 0) > balance) {
      return {
        isValid: false,
        message: `Total Cash Advance Amount for ${partyName} cannot exceed the Available Cash Advance of ${formatAmount(balance)}.`,
      };
    }
  }

  return { isValid: true, message: null };
}

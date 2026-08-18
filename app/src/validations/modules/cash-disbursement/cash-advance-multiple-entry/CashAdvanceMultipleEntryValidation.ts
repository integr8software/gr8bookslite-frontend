import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { CashAdvanceMultipleEntryFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { formatAmount } from "@/app/src/utils/currency.util";

const CashAdvanceMultipleEntrySchema = z.object({
  accountCode: z.string().trim().min(1, "Default Account is required."),
  currency: z.string().trim().min(1, "Currency is required."),
  documentDate: z.string().trim().min(1, "Document Date is required."),
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
  partyName: z.string().trim().min(1, "Party Name is required."),
  transNo: z.string().trim().min(1, "CAME No. is required."),
});

export function validateCashAdvanceMultipleEntryForm(values: CashAdvanceMultipleEntryFormValues) {
  const result = CashAdvanceMultipleEntrySchema.safeParse(values);

  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message ?? "Review the Cash Advance Multiple Entry details.",
    };
  }

  const hasAmountLine = values.items.some((item) => parseMoneyNumberInput(item.amount) > 0);

  if (!hasAmountLine) {
    return {
      isValid: false,
      message: "Add at least one item with an amount.",
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
        message: `Total amount for ${partyName} cannot exceed the Cash Advance Balance of ${formatAmount(balance)}.`,
      };
    }
  }

  return { isValid: true, message: null };
}

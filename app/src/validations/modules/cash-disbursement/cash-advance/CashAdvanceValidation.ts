import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  CashAdvanceFormErrors,
  CashAdvanceFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { formatAmount } from "@/app/src/utils/currency.util";

const CashAdvanceDraftFormSchema = z.object({
  documentDate: z.string().trim().min(1, "Select a CA Date."),
  transNo: z.string().trim().min(1, "CA No. is required."),
});

const CashAdvanceFormSchema = z.object({
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.preprocess((value) => String(value ?? ""), z.string().trim().min(1, "Default Account Title is required.")),
  amount: z.preprocess(
    (value) => String(value ?? "").trim(),
    z
      .string()
      .min(1, "Amount is required.")
      .refine((value) => {
        const amount = Number(value.replace(/,/g, ""));

        return Number.isFinite(amount) && amount > 0;
      }, "Enter an Amount greater than zero."),
  ),
  documentDate: z.string().trim().min(1, "Select a CA Date."),
  partyCode: z.string().trim().min(1, "Party Code is required."),
  partyName: z.string().trim().min(1, "Party Name is required."),
  transNo: z.string().trim().min(1, "CA No. is required."),
});

export function validateCashAdvanceForm(values: CashAdvanceFormValues): CashAdvanceFormErrors {
  const validation = (values.status === CashAdvanceStatuses.draft ? CashAdvanceDraftFormSchema : CashAdvanceFormSchema).safeParse(values);

  if (validation.success) {
    return {};
  }

  const errors: CashAdvanceFormErrors = {};

  for (const issue of validation.error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && field in values && !errors[field as keyof CashAdvanceFormErrors]) {
      errors[field as keyof CashAdvanceFormErrors] = issue.message;
    }
  }

  return errors;
}

export function getCashAdvanceAvailabilityWarning(values: CashAdvanceFormValues): string | null {
  const amount = parseMoneyNumberInput(values.amount);
  const hasLimit = Boolean(values.cashAdvanceLimit.trim());
  const hasAvailableAmount = Boolean(values.availableCashAdvance.trim());
  const limit = parseMoneyNumberInput(values.cashAdvanceLimit);
  const availableAmount = parseMoneyNumberInput(values.availableCashAdvance);
  const exceedsLimit = hasLimit && amount > limit;
  const exceedsAvailableAmount = hasAvailableAmount && amount > availableAmount;

  if (!exceedsLimit && !exceedsAvailableAmount) {
    return null;
  }

  if (exceedsLimit && exceedsAvailableAmount) {
    return `The Cash Advance Amount of ${formatAmount(amount)} exceeds the Cash Advance Limit of ${formatAmount(limit)} and the Available Cash Advance of ${formatAmount(availableAmount)}.`;
  }

  if (exceedsLimit) {
    return `The Cash Advance Amount of ${formatAmount(amount)} exceeds the Cash Advance Limit of ${formatAmount(limit)}.`;
  }

  return `The Cash Advance Amount of ${formatAmount(amount)} exceeds the Available Cash Advance of ${formatAmount(availableAmount)}.`;
}

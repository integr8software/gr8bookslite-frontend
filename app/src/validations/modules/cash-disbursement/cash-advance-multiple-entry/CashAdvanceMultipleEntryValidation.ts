import { z } from "zod";
import type { CashAdvanceMultipleEntryFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";

const CashAdvanceMultipleEntrySchema = z.object({
  accountCode: z.string().trim().min(1, "Default Account is required."),
  costCenter: z.string().trim().min(1, "Cost Center is required."),
  documentDate: z.string().trim().min(1, "Document Date is required."),
  items: z.array(
    z.object({
      amount: z.string().trim(),
      partyName: z.string().trim(),
    }),
  ),
  partyName: z.string().trim().min(1, "Party Name is required."),
  transNo: z.string().trim().min(1, "Multiply Cash Advance No. is required."),
});

export function validateCashAdvanceMultipleEntryForm(
  values: CashAdvanceMultipleEntryFormValues,
) {
  const result = CashAdvanceMultipleEntrySchema.safeParse(values);

  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message ?? "Review the Cash Advances Multiple Entry details.",
    };
  }

  const hasAmountLine = values.items.some((item) => Number(item.amount || 0) > 0);

  if (!hasAmountLine) {
    return {
      isValid: false,
      message: "Add at least one item with an amount.",
    };
  }

  return { isValid: true, message: null };
}

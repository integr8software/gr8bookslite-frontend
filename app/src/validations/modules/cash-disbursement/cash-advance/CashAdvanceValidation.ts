import { z } from "zod";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

const CashAdvanceFormSchema = z.object({
  accountCode: z.string().trim().min(1, "Select an account."),
  amount: z.preprocess(
    (value) => String(value ?? "").trim(),
    z
      .string()
      .min(1, "Amount is required.")
      .refine(
        (value) => {
          const amount = Number(value.replace(/,/g, ""));

          return Number.isFinite(amount) && amount > 0;
        },
        "Enter an amount greater than zero.",
      )
      .transform((value) => Number(value.replace(/,/g, ""))),
  ),
  documentDate: z.string().trim().min(1, "Select a document date."),
  partyName: z.string().trim().min(1, "Select a party."),
});

export function validateCashAdvanceForm(values: CashAdvanceFormValues) {
  const validation = CashAdvanceFormSchema.safeParse(values);

  if (validation.success) {
    return { isValid: true, message: null };
  }

  return {
    isValid: false,
    message: validation.error.issues[0]?.message ?? "Review the cash advance details.",
  };
}

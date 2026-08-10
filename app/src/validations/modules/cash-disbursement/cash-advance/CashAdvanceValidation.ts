import { z } from "zod";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

const CashAdvanceFormSchema = z.object({
  accountCode: z.string().trim().min(1, "Select an account."),
  amount: z.coerce.number().positive("Enter an amount greater than zero."),
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

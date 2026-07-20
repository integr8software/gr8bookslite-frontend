import { z } from "zod";
import { getJournalVoucherTotals } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import type {
  JournalVoucherFormErrors,
  JournalVoucherFormValues,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

const journalVoucherHeaderSchema = z.object({
  transactionNo: z.string().trim().min(1, "Enter a transaction number."),
  documentDate: z.string().trim().min(1, "Select a document date."),
  currencyType: z.string().trim().min(1, "Select a currency."),
  currencyRate: z.number().positive("Enter an exchange rate greater than zero."),
  status: z.string().trim().min(1, "Select a status."),
});

const journalVoucherLineSchema = z.object({
  accountCode: z.string().trim().min(1, "Enter an account code."),
  accountTitle: z.string().trim().min(1, "Enter an account title."),
  debit: z.number().min(0, "Debit cannot be negative."),
  credit: z.number().min(0, "Credit cannot be negative."),
});

export function validateJournalVoucherForm(
  values: JournalVoucherFormValues,
): JournalVoucherFormErrors {
  const errors: JournalVoucherFormErrors = {};
  const headerResult = journalVoucherHeaderSchema.safeParse(values);

  if (!headerResult.success) {
    for (const issue of headerResult.error.issues) {
      const field = issue.path[0] as keyof JournalVoucherFormValues | undefined;

      if (field) {
        errors[field] = issue.message;
      }
    }
  }

  if (values.lines.length <= 1) {
    errors.lines = "Add at least two journal voucher entry rows.";
  }

  for (const line of values.lines) {
    const lineResult = journalVoucherLineSchema.safeParse(line);
    const hasDebit = Number(line.debit || 0) > 0;
    const hasCredit = Number(line.credit || 0) > 0;

    if (!lineResult.success || (!hasDebit && !hasCredit)) {
      errors.lineErrors = errors.lineErrors ?? {};
      errors.lineErrors[line.id] = errors.lineErrors[line.id] ?? {};

      for (const issue of lineResult.success ? [] : lineResult.error.issues) {
        const field = issue.path[0] as keyof typeof line | undefined;

        if (field) {
          errors.lineErrors[line.id][field] = issue.message;
        }
      }

      if (!hasDebit && !hasCredit) {
        const amountError = "Enter either a debit or credit amount.";

        errors.lineErrors[line.id].debit = amountError;
        errors.lineErrors[line.id].credit = amountError;
      }
    }

    if (hasDebit && hasCredit) {
      errors.lineErrors = errors.lineErrors ?? {};
      errors.lineErrors[line.id] = {
        ...errors.lineErrors[line.id],
        credit: "Use only one amount side per line.",
      };
    }
  }

  const totals = getJournalVoucherTotals(values.lines);

  if (Math.abs(totals.variance) >= 0.001) {
    errors.balance = "Variance must be zero before saving.";
  }

  return errors;
}

import { z } from "zod";
import { getCreditMemoAccountingTotals } from "@/app/src/data/modules/general-journal/credit-memo/CreditMemoData";
import type {
  CreditMemoFormErrors,
  CreditMemoFormValues,
} from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";

const CreditMemoHeaderSchema = z.object({
  transactionNo: z.string().trim().min(1, "Enter a transaction number."),
  documentDate: z.string().trim().min(1, "Select a document date."),
  partyCode: z.string().trim().min(1, "Select a party."),
  partyName: z.string().trim().min(1, "Select a party name."),
  address: z.string(),
  contactPerson: z.string(),
  contactNo: z.string(),
  projectCode: z.string(),
  projectName: z.string(),
  currency: z.string().trim().min(1, "Select a currency."),
  exchangeRate: z.number().positive("Enter an exchange rate greater than zero."),
  amount: z.number(),
  referenceNo: z.string(),
  remarks: z.string().max(500, "Remarks must be 500 characters or fewer."),
  status: z.string().trim().min(1, "Enter a status."),
});

const CreditMemoAccountingEntrySchema = z.object({
  accountCode: z.string().trim().min(1, "Enter an account code."),
  accountTitle: z.string().trim().min(1, "Enter an account title."),
  debit: z.number().min(0, "Debit cannot be negative."),
  credit: z.number().min(0, "Credit cannot be negative."),
});

export function validateCreditMemoForm(
  values: CreditMemoFormValues,
): CreditMemoFormErrors {
  const errors: CreditMemoFormErrors = {};
  const headerResult = CreditMemoHeaderSchema.safeParse(values);

  if (!headerResult.success) {
    for (const issue of headerResult.error.issues) {
      const field = issue.path[0] as keyof CreditMemoFormValues | undefined;

      if (field) {
        errors[field] = issue.message;
      }
    }
  }

  validateAccountingEntries(values, errors);

  return errors;
}

function validateAccountingEntries(
  values: CreditMemoFormValues,
  errors: CreditMemoFormErrors,
) {
  if (values.accountingEntries.length <= 1) {
    errors.accountingEntries = "Add at least two accounting entry rows.";
  }

  for (const entry of values.accountingEntries) {
    const entryResult = CreditMemoAccountingEntrySchema.safeParse(entry);
    const hasDebit = Number(entry.debit || 0) > 0;
    const hasCredit = Number(entry.credit || 0) > 0;

    if (!entryResult.success || (!hasDebit && !hasCredit)) {
      errors.accountingEntryErrors = errors.accountingEntryErrors ?? {};
      errors.accountingEntryErrors[entry.id] =
        errors.accountingEntryErrors[entry.id] ?? {};

      for (const issue of entryResult.success ? [] : entryResult.error.issues) {
        const field = issue.path[0] as keyof typeof entry | undefined;

        if (field) {
          errors.accountingEntryErrors[entry.id][field] = issue.message;
        }
      }

      if (!hasDebit && !hasCredit) {
        const amountError = "Enter either a debit or credit amount.";

        errors.accountingEntryErrors[entry.id].debit = amountError;
        errors.accountingEntryErrors[entry.id].credit = amountError;
      }
    }

    if (hasDebit && hasCredit) {
      errors.accountingEntryErrors = errors.accountingEntryErrors ?? {};
      errors.accountingEntryErrors[entry.id] = {
        ...errors.accountingEntryErrors[entry.id],
        credit: "Use only one amount side per line.",
      };
    }
  }

  const totals = getCreditMemoAccountingTotals(values.accountingEntries);

  if (Math.abs(totals.variance) >= 0.001) {
    errors.balance = "Variance must be zero before saving.";
  }
}

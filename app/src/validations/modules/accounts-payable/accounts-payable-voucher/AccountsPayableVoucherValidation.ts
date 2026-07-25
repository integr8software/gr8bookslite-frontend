import { z } from "zod";
import {
  getAccountsPayableVoucherAccountingTotals,
  getAccountsPayableVoucherExpenseTotals,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import type {
  AccountsPayableVoucherFormErrors,
  AccountsPayableVoucherFormValues,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

const accountsPayableVoucherHeaderSchema = z.object({
  transactionNo: z.string().trim().min(1, "Enter a transaction number."),
  documentDate: z.string().trim().min(1, "Select a document date."),
  partyCode: z.string().trim().min(1, "Select a party."),
  partyName: z.string().trim().min(1, "Select a party name."),
  currency: z.string().trim().min(1, "Select a currency."),
  exchangeRate: z.number().positive("Enter an exchange rate greater than zero."),
  amount: z.number(),
  termId: z.string().trim().min(1, "Select terms."),
  terms: z.string().trim().min(1, "Select terms."),
  dueDate: z.string().trim().min(1, "Select a due date."),
  creditAccountCode: z.string().trim().min(1, "Select a payable account."),
  creditAccountTitle: z.string().trim().min(1, "Select a payable account."),
  payableType: z.string().trim().min(1, "Select a payable type."),
  status: z.string().trim().min(1, "Enter a status."),
});

const accountsPayableVoucherExpenseLineSchema = z.object({
  expenseAccountCode: z.string().trim().min(1, "Enter an account code."),
  expenseType: z.string().trim().min(1, "Enter an expense type."),
  amount: z
    .number()
    .refine((value) => Math.abs(value) > 0, "Enter a non-zero amount."),
});

const accountsPayableVoucherAccountingEntrySchema = z.object({
  accountCode: z.string().trim().min(1, "Enter an account code."),
  accountTitle: z.string().trim().min(1, "Enter an account title."),
  debit: z.number().min(0, "Debit cannot be negative."),
  credit: z.number().min(0, "Credit cannot be negative."),
});

export function validateAccountsPayableVoucherForm(
  values: AccountsPayableVoucherFormValues,
): AccountsPayableVoucherFormErrors {
  const errors: AccountsPayableVoucherFormErrors = {};
  const headerResult = accountsPayableVoucherHeaderSchema.safeParse(values);

  if (!headerResult.success) {
    for (const issue of headerResult.error.issues) {
      const field =
        issue.path[0] as keyof AccountsPayableVoucherFormValues | undefined;

      if (field) {
        errors[field] = issue.message;
      }
    }
  }

  validateExpenseLines(values, errors);
  validateAccountingEntries(values, errors);

  return errors;
}

function validateExpenseLines(
  values: AccountsPayableVoucherFormValues,
  errors: AccountsPayableVoucherFormErrors,
) {
  if (values.expenseLines.length === 0) {
    errors.expenseLines = "Add at least one expense row.";
  }

  for (const line of values.expenseLines) {
    const lineResult = accountsPayableVoucherExpenseLineSchema.safeParse(line);

    if (lineResult.success) {
      continue;
    }

    errors.expenseLineErrors = errors.expenseLineErrors ?? {};
    errors.expenseLineErrors[line.id] = errors.expenseLineErrors[line.id] ?? {};

    for (const issue of lineResult.error.issues) {
      const field = issue.path[0] as keyof typeof line | undefined;

      if (field) {
        errors.expenseLineErrors[line.id][field] = issue.message;
      }
    }
  }

  const expenseTotals = getAccountsPayableVoucherExpenseTotals(
    values.expenseLines,
  );

  if (Math.abs(expenseTotals.totalAmountDue - values.amount) >= 0.001) {
    errors.expenseLines = "Expense total due must match the voucher amount.";
  }
}

function validateAccountingEntries(
  values: AccountsPayableVoucherFormValues,
  errors: AccountsPayableVoucherFormErrors,
) {
  if (values.accountingEntries.length <= 1) {
    errors.accountingEntries = "Add at least two accounting entry rows.";
  }

  for (const entry of values.accountingEntries) {
    const entryResult =
      accountsPayableVoucherAccountingEntrySchema.safeParse(entry);
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

  const totals = getAccountsPayableVoucherAccountingTotals(
    values.accountingEntries,
  );

  if (Math.abs(totals.variance) >= 0.001) {
    errors.balance = "Variance must be zero before saving.";
  }

  const expectedAccountingTotal =
    getAccountsPayableVoucherAccountingControlTotal(values);

  if (
    expectedAccountingTotal > 0 &&
    (Math.abs(totals.totalDebit - expectedAccountingTotal) >= 0.001 ||
      Math.abs(totals.totalCredit - expectedAccountingTotal) >= 0.001)
  ) {
    errors.accountingEntries =
      "Accounting debit and credit totals must match the expense total.";
  }
}

function getAccountsPayableVoucherAccountingControlTotal(
  values: AccountsPayableVoucherFormValues,
) {
  const total = values.expenseLines.reduce(
    (sum, line) => sum + Math.abs(Number(line.amount || 0)),
    0,
  );

  return Math.round(total * 100) / 100;
}

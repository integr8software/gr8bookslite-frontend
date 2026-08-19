import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export const DisbursementVoucherDetailsValidationSchema = z.object({
  paymentMethod: z.string().trim().min(1, "Payment method is required."),
  partyCode: z.string().trim().min(1, "Party code is required."),
  partyName: z.string().trim().min(1, "Party name is required."),
});

const DisbursementVoucherLineEntryValidationSchema = z.object({
  accountCode: z.string(),
  accountName: z.string(),
  debit: z.number(),
  credit: z.number(),
});

const CUSTOM_ISSUE_CODE = z.ZodIssueCode.custom;

export const DisbursementVoucherEntriesValidationSchema = z
  .array(DisbursementVoucherLineEntryValidationSchema)
  .superRefine((entries, context) => {
    if (entries.length < 2) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Add at least two line entries.",
      });
      return;
    }

    const hasIncompleteEntry = entries.some(
      (entry) => !entry.accountName.trim() || !entry.accountCode.trim() || (entry.debit <= 0 && entry.credit <= 0),
    );

    if (hasIncompleteEntry) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Each line needs an account title, account code, and either a debit or credit amount.",
      });
      return;
    }

    if (entries.some((entry) => entry.debit > 0 && entry.credit > 0)) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Each line can only carry a debit or a credit amount.",
      });
      return;
    }

    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);

    if (totalDebit <= 0 || totalCredit <= 0) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Entries must include both debit and credit values.",
      });
      return;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Debit and credit totals must balance before review.",
      });
    }
  });

export const DisbursementVoucherEntryDraftValidationSchema = z
  .object({
    accountCode: z.string().trim().min(1, "Account code is required."),
    accountName: z.string().trim().min(1, "Account title is required."),
    debit: z.string(),
    credit: z.string(),
  })
  .superRefine((entry, context) => {
    const debit = parseMoneyNumberInput(entry.debit);
    const credit = parseMoneyNumberInput(entry.credit);

    if (debit <= 0 && credit <= 0) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Enter a debit or credit amount.",
      });
      return;
    }

    if (debit > 0 && credit > 0) {
      context.addIssue({
        code: CUSTOM_ISSUE_CODE,
        message: "Each line can only carry a debit or a credit amount.",
      });
    }
  });

export function validateDisbursementVoucherDetails(values: DisbursementVoucherFormValues) {
  const errors: DisbursementVoucherFormErrors = {};
  const result = DisbursementVoucherDetailsValidationSchema.safeParse(values);

  if (result.success) {
    return errors;
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0] as "paymentMethod" | "partyCode" | "partyName" | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function validateDisbursementVoucherEntries(values: DisbursementVoucherFormValues) {
  const result = DisbursementVoucherEntriesValidationSchema.safeParse(values.lineEntries);

  if (result.success) {
    return {};
  }

  return {
    lineEntries: result.error.issues[0]?.message ?? "Review the accounting entries.",
  } satisfies DisbursementVoucherFormErrors;
}

export function validateDisbursementEntryDraft(draft: DisbursementVoucherEntryDraft) {
  const result = DisbursementVoucherEntryDraftValidationSchema.safeParse(draft);

  return result.success ? undefined : result.error.issues[0]?.message;
}

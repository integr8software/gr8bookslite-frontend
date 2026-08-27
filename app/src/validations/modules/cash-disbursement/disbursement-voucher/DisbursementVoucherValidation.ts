import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";

export const DisbursementVoucherDetailsValidationSchema = z.object({
  paymentMethod: z.string().trim().min(1, "Payment method is required."),
  partyCode: z.string().trim().min(1, "Party code is required."),
  partyName: z.string().trim().min(1, "Party name is required."),
  voucherDate: z.string().trim().min(1, "Select a DV Date."),
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

export function validateDisbursementVoucherDetails(
  values: DisbursementVoucherFormValues,
  paymentTypeRecord?: PaymentTypeRecord | null,
) {
  const errors: DisbursementVoucherFormErrors = {};
  const result = DisbursementVoucherDetailsValidationSchema.safeParse(values);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as "paymentMethod" | "partyCode" | "partyName" | "voucherDate" | undefined;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  const paymentType = paymentTypeRecord?.type;
  const normalizedPaymentMethod = values.paymentMethod.trim().toLowerCase();
  const requiresCheckDetails =
    paymentType === "Check" ||
    paymentType === "Debit Memo" ||
    normalizedPaymentMethod.includes("check") ||
    normalizedPaymentMethod.includes("debit memo");
  const requiresTransferDetails =
    paymentType === "Bank Transfer" ||
    paymentType === "Digital Wallet" ||
    normalizedPaymentMethod.includes("bank transfer") ||
    normalizedPaymentMethod.includes("wire") ||
    normalizedPaymentMethod === "transfer" ||
    normalizedPaymentMethod.includes("instapay") ||
    normalizedPaymentMethod.includes("pesonet") ||
    normalizedPaymentMethod.includes("peso net") ||
    normalizedPaymentMethod.includes("ewallet") ||
    normalizedPaymentMethod.includes("e-wallet") ||
    normalizedPaymentMethod.includes("wallet") ||
    normalizedPaymentMethod.includes("online");

  if (requiresCheckDetails) {
    if (!values.paymentDetails.bankAccountCode.trim()) errors.bankAccountCode = "Bank is required.";
    if (!(values.paymentDetails.payee ?? values.partyName).trim()) errors.payee = "Payee is required.";
    if (!values.paymentDetails.isMultiCheckNumber && !values.paymentDetails.checkNo.trim()) {
      errors.checkNo = paymentType === "Debit Memo" || normalizedPaymentMethod.includes("debit memo")
        ? "Debit memo number is required."
        : "Check number is required.";
    }
    if (!(values.paymentDetails.checkDate || values.voucherDate).trim()) errors.checkDate = "Check date is required.";
  }

  if (requiresTransferDetails) {
    if (!values.paymentDetails.bankAccountCode.trim()) errors.bankAccountCode = "From bank is required.";
    if (!(values.paymentDetails.transferToBank ?? "").trim()) errors.transferToBank = "To bank is required.";
    if (!(values.paymentDetails.transferAccountNo ?? "").trim()) errors.transferAccountNo = "Account number is required.";
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

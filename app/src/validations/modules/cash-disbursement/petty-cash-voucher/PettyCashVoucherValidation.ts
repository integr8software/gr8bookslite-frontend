import { z } from "zod";
import type {
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
  PettyCashVoucherFormStatusOptions,
  PettyCashVoucherStatuses,
  PettyCashVoucherTransactionNumberPadding,
  PettyCashVoucherTransactionPrefix,
  PettyCashVoucherVATableOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const requiredText = (message: string) => z.string().trim().min(1, message);
const transactionNumberPattern = new RegExp(`^${PettyCashVoucherTransactionPrefix}-\\d{${PettyCashVoucherTransactionNumberPadding}}$`);
const amount = z.preprocess(
  (value) => (typeof value === "string" ? parseAmount(value) : value),
  z.coerce.number().finite().min(0, "Enter a valid Amount."),
);

export const PettyCashVoucherDraftFormValidationSchema = z.object({
  documentDate: requiredText("Select a PCV Date."),
  transactionNo: requiredText("PCV No. is required.").regex(
    transactionNumberPattern,
    "Use the generated PCV No. format.",
  ),
});

export const PettyCashVoucherFormValidationSchema = z.object({
  accountCode: requiredText("Default Account Code is required."),
  accountTitle: requiredText("Default Account Title is required."),
  amount: amount.refine((value) => value > 0, "Amount is required."),
  documentDate: requiredText("Select a PCV Date."),
  currency: requiredText("Currency is required."),
  exchangeRate: requiredText("Enter an Exchange Rate.").refine((value) => Number(value) > 0, "Exchange Rate must be greater than zero."),
  ewtCode: z.string().optional(),
  ewtRate: z.string().optional(),
  ewtAmount: amount.optional(),
  netAmount: amount,
  remarks: z.string().max(500, "Remarks can only be up to 500 characters."),
  responsibilityCenter: z.string(),
  responsibilityCenterCode: z.string(),
  status: z.enum(PettyCashVoucherFormStatusOptions),
  transactionNo: requiredText("PCV No. is required.").regex(
    transactionNumberPattern,
    "Use the generated PCV No. format.",
  ),
  vatType: z.string().optional(),
  vatable: z.enum(PettyCashVoucherVATableOptions).optional(),
  vatRate: z.string().optional(),
  vatAmount: amount,
  partyCode: requiredText("Party Code is required."),
  partyName: requiredText("Party Name is required."),
});

export function validatePettyCashVoucherForm(values: PettyCashVoucherFormValues): PettyCashVoucherFormErrors {
  const result = (values.status === PettyCashVoucherStatuses.Draft
    ? PettyCashVoucherDraftFormValidationSchema
    : PettyCashVoucherFormValidationSchema
  ).safeParse(values);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<PettyCashVoucherFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof PettyCashVoucherFormErrors;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

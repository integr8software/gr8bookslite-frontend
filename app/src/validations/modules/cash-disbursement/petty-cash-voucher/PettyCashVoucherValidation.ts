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
  z.coerce.number().finite().min(0, "Enter a valid amount."),
);

export const PettyCashVoucherDraftFormValidationSchema = z.object({
  documentDate: requiredText("Select a PCV Date."),
  transactionNo: requiredText("Generate a PCV No.").regex(
    transactionNumberPattern,
    "Use the generated PCV number format.",
  ),
});

export const PettyCashVoucherFormValidationSchema = z.object({
  accountCode: requiredText("Enter an account code."),
  accountTitle: requiredText("Enter an account title."),
  amount: amount.refine((value) => value > 0, "Enter an amount."),
  documentDate: requiredText("Select a PCV Date."),
  currency: requiredText("Select a currency."),
  exchangeRate: requiredText("Enter an exchange rate.").refine((value) => Number(value) > 0, "Exchange rate must be greater than zero."),
  ewtCode: z.string().optional(),
  ewtRate: z.string().optional(),
  ewtAmount: amount.optional(),
  netAmount: amount,
  remarks: z.string().max(500, "Remarks can only be up to 500 characters."),
  responsibilityCenter: z.string(),
  responsibilityCenterCode: z.string(),
  status: z.enum(PettyCashVoucherFormStatusOptions),
  transactionNo: requiredText("Generate a PCV No.").regex(
    transactionNumberPattern,
    "Use the generated PCV number format.",
  ),
  vatType: z.string().optional(),
  vatable: z.enum(PettyCashVoucherVATableOptions).optional(),
  vatRate: z.string().optional(),
  vatAmount: amount,
  partyCode: requiredText("Enter a party code."),
  partyName: requiredText("Enter a party name."),
});

export function validatePettyCashVoucherForm(values: PettyCashVoucherFormValues): PettyCashVoucherFormErrors {
  const result = (values.status === PettyCashVoucherStatuses.draft
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

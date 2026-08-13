import { z } from "zod";
import type {
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
  PettyCashVoucherFormStatusOptions,
  PettyCashVoucherTransactionNumberPadding,
  PettyCashVoucherTransactionPrefix,
  PettyCashVoucherVATableOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const requiredText = (message: string) => z.string().trim().min(1, message);
const transactionNumberPattern = new RegExp(
  `^${PettyCashVoucherTransactionPrefix}-\\d{${PettyCashVoucherTransactionNumberPadding}}$`,
);
const amount = z.preprocess(
  (value) => (typeof value === "string" ? parseAmount(value) : value),
  z.coerce.number().finite().min(0, "Enter a valid amount."),
);

export const PettyCashVoucherFormValidationSchema = z.object({
  accountCode: requiredText("Enter an account code."),
  accountTitle: requiredText("Enter an account title."),
  amount: amount.refine(
    (value) => value > 0,
    "Enter an amount.",
  ),
  documentDate: requiredText("Select a petty cash voucher date."),
  netAmount: amount,
  remarks: z.string().max(500, "Remarks can only be up to 500 characters."),
  responsibilityCenter: z.string(),
  responsibilityCenterCode: z.string(),
  status: z.enum(PettyCashVoucherFormStatusOptions),
  transactionNo: requiredText("Generate a petty cash voucher number.").regex(
    transactionNumberPattern,
    "Use the generated petty cash voucher number format.",
  ),
  vatable: z.enum(PettyCashVoucherVATableOptions),
  vatAmount: amount,
  partyCode: requiredText("Enter a party code."),
  partyName: requiredText("Enter a party name."),
});

export function validatePettyCashVoucherForm(
  values: PettyCashVoucherFormValues,
): PettyCashVoucherFormErrors {
  const result = PettyCashVoucherFormValidationSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<PettyCashVoucherFormErrors>(
    (errors, issue) => {
      const field = issue.path[0] as keyof PettyCashVoucherFormErrors;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );
}

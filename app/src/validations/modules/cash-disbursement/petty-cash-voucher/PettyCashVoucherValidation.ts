import { z } from "zod";
import type {
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);
const amount = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/,/g, "") : value),
  z.coerce.number().finite().min(0, "Enter a valid amount."),
);

export const PettyCashVoucherFormValidationSchema = z.object({
  accountCode: requiredText("Enter an account code."),
  accountTitle: requiredText("Enter an account title."),
  amount: amount.refine(
    (value) => value > 0,
    "Enter an amount greater than zero.",
  ),
  costCenter: z.string(),
  documentDate: requiredText("Select a document date."),
  netAmount: amount,
  remarks: z.string(),
  status: z.enum(["Pending", "Approved", "Cancelled"]),
  transactionNo: requiredText("Enter a transaction number."),
  vatable: z.enum(["False", "True"]),
  vatAmount: amount,
  vceCode: requiredText("Enter a VCE code."),
  vceName: requiredText("Enter a VCE name."),
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

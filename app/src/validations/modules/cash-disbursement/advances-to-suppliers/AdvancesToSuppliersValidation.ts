import { z } from "zod";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AdvancesToSuppliersFormErrors,
  AdvancesToSuppliersFormValues,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { AdvancesToSuppliersStatuses } from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";

const AdvancesToSuppliersDraftSchema = z.object({
  transactionNo: z.string().regex(/^ATS-(?:\d{4}-)?\d{6}$/, "A valid ATS No. is required."),
  documentDate: z.string().min(1, "ATS Date is required."),
});

const AdvancesToSuppliersSchema = z.object({
  transactionNo: z.string().regex(/^ATS-(?:\d{4}-)?\d{6}$/, "A valid ATS No. is required."),
  documentDate: z.string().min(1, "ATS Date is required."),
  partyCode: z.string().min(1, "Party Code is required."),
  partyName: z.string().min(1, "Party Name is required."),
  accountCode: z.string().min(1, "Default Account Code is required."),
  accountTitle: z.string().min(1, "Default Account Title is required."),
  poReference: z.string().min(1, "PO Reference is required."),
});

export function validateAdvancesToSuppliersForm(values: AdvancesToSuppliersFormValues): AdvancesToSuppliersFormErrors {
  const errors: AdvancesToSuppliersFormErrors = {};
  const result = (values.status === AdvancesToSuppliersStatuses.draft ? AdvancesToSuppliersDraftSchema : AdvancesToSuppliersSchema).safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as keyof AdvancesToSuppliersFormValues] ??= issue.message;
    }
  }
  if (values.status === AdvancesToSuppliersStatuses.draft) return errors;
  const totalPoAmount = parseMoneyNumberInput(values.totalPoAmount);
  const percentage = parseMoneyNumberInput(values.advancePaymentPercentage);
  const advanceAmount = parseMoneyNumberInput(values.advancePaymentAmount);

  if (totalPoAmount <= 0) {
    errors.totalPoAmount = "Amount must be greater than zero.";
  }

  if (values.advancePaymentType === "Fixed Amount") {
    if (advanceAmount <= 0) {
      errors.advancePaymentAmount = "Amount of Advance Payment must be greater than zero.";
    } else if (totalPoAmount > 0 && advanceAmount > totalPoAmount) {
      errors.advancePaymentAmount = "Amount of Advance Payment cannot exceed Amount.";
    }
  } else {
    if (percentage <= 0 || percentage > 100) {
      errors.advancePaymentPercentage = "Advance Payment % must be greater than zero and not exceed 100%.";
    }
    if (advanceAmount <= 0) {
      errors.advancePaymentAmount = "Amount of Advance Payment must be greater than zero.";
    }
  }
  return errors;
}

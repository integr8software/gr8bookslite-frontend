import { z } from "zod";
import type {
  RevolvingFundReplenishmentFormErrors,
  RevolvingFundReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const draftSchema = z.object({
  transactionNo: z.string().regex(/^RFR-\d{6}$/, "RFR No. is required."),
  documentDate: z.string().min(1, "Select an RFR Date."),
});

const schema = z.object({
  transactionNo: z.string().regex(/^RFR-\d{6}$/, "RFR No. is required."),
  documentDate: z.string().min(1, "Select an RFR Date."),
  partyCode: z.string().trim().min(1, "Party Code is required."),
  partyName: z.string().trim().min(1, "Party Name is required."),
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.string().trim().min(1, "Default Account Title is required."),
});

export function validateRevolvingFundReplenishmentForm(values: RevolvingFundReplenishmentFormValues): RevolvingFundReplenishmentFormErrors {
  const errors: RevolvingFundReplenishmentFormErrors = {};
  const result = (values.status === RevolvingFundReplenishmentStatuses.Draft ? draftSchema : schema).safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as keyof RevolvingFundReplenishmentFormValues] ??= issue.message;
    }
  }
  if (values.status === RevolvingFundReplenishmentStatuses.Draft) return errors;
  if (
    values.entries.length === 0 ||
    values.entries.every((entry) => !entry.revolvingFundNo.trim() && (parseAmount(entry.amount) ?? 0) <= 0)
  ) {
    errors.entries = "Add at least one revolving fund voucher entry.";
  } else if (
    values.entries.some(
      (entry) =>
        !entry.revolvingFundNo.trim() ||
        !entry.supplierCode.trim() ||
        !entry.supplierName.trim() ||
        (parseAmount(entry.amount) ?? 0) <= 0,
    )
  ) {
    errors.entries = "Each entry needs a Revolving Fund Voucher, Supplier, and Amount greater than zero.";
  }
  const voucherNumbers = values.entries.map((entry) => entry.revolvingFundNo.trim().toLowerCase()).filter(Boolean);
  if (new Set(voucherNumbers).size !== voucherNumbers.length) {
    errors.entries = "Petty Cash Numbers must be unique.";
  }
  return errors;
}

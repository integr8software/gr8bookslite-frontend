import { z } from "zod";
import type {
  RevolvingFundReplenishmentFormErrors,
  RevolvingFundReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const draftSchema = z.object({
  transactionNo: z.string().regex(/^RFR-\d{6}$/, "A valid RFR No. is required."),
  documentDate: z.string().min(1, "Select an RFR Date."),
});

const schema = z.object({
  transactionNo: z.string().regex(/^RFR-\d{6}$/, "A valid RFR No. is required."),
  documentDate: z.string().min(1, "Select an RFR Date."),
  partyCode: z.string().trim().min(1, "Select a party."),
  partyName: z.string().trim().min(1, "Select a party."),
  accountCode: z.string().trim().min(1, "Select a default account."),
  accountTitle: z.string().trim().min(1, "Select a default account."),
});

export function validateRevolvingFundReplenishmentForm(values: RevolvingFundReplenishmentFormValues): RevolvingFundReplenishmentFormErrors {
  const errors: RevolvingFundReplenishmentFormErrors = {};
  const result = (values.status === RevolvingFundReplenishmentStatuses.draft ? draftSchema : schema).safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as keyof RevolvingFundReplenishmentFormValues] ??= issue.message;
    }
  }
  if (values.status === RevolvingFundReplenishmentStatuses.draft) return errors;
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
    errors.entries = "Each entry needs a revolving fund voucher, supplier, and amount greater than zero.";
  }
  const voucherNumbers = values.entries.map((entry) => entry.revolvingFundNo.trim().toLowerCase()).filter(Boolean);
  if (new Set(voucherNumbers).size !== voucherNumbers.length) {
    errors.entries = "Petty Cash numbers must be unique.";
  }
  return errors;
}

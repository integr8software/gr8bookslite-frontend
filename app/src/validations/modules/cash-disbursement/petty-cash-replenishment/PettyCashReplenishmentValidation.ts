import { z } from "zod";
import type {
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { PettyCashReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const draftSchema = z.object({
  transactionNo: z.string().regex(/^PCR-\d{6}$/, "A valid PCR No. is required."),
  documentDate: z.string().min(1, "Select a PCR Date."),
});

const schema = z.object({
  transactionNo: z.string().regex(/^PCR-\d{6}$/, "A valid PCR No. is required."),
  documentDate: z.string().min(1, "Select a PCR Date."),
  partyCode: z.string().trim().min(1, "Party Code is required."),
  partyName: z.string().trim().min(1, "Party Name is required."),
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.string().trim().min(1, "Default Account Title is required."),
});

export function validatePettyCashReplenishmentForm(values: PettyCashReplenishmentFormValues): PettyCashReplenishmentFormErrors {
  const errors: PettyCashReplenishmentFormErrors = {};
  const result = (values.status === PettyCashReplenishmentStatuses.draft ? draftSchema : schema).safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as keyof PettyCashReplenishmentFormValues] ??= issue.message;
    }
  }
  if (values.status === PettyCashReplenishmentStatuses.draft) return errors;
  if (
    values.entries.length === 0 ||
    values.entries.every((entry) => !entry.pettyCashNo.trim() && (parseAmount(entry.amount) ?? 0) <= 0)
  ) {
    errors.entries = "Add at least one petty cash voucher entry.";
  } else if (
    values.entries.some(
      (entry) =>
        !entry.pettyCashNo.trim() ||
        !entry.supplierCode.trim() ||
        !entry.supplierName.trim() ||
        (parseAmount(entry.amount) ?? 0) <= 0,
    )
  ) {
    errors.entries = "Each entry needs a Petty Cash Voucher, Supplier, and Amount greater than zero.";
  }
  const voucherNumbers = values.entries.map((entry) => entry.pettyCashNo.trim().toLowerCase()).filter(Boolean);
  if (new Set(voucherNumbers).size !== voucherNumbers.length) {
    errors.entries = "Petty Cash Numbers must be unique.";
  }
  return errors;
}

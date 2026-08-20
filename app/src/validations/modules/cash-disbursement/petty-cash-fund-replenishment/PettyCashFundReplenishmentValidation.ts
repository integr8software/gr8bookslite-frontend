import { z } from "zod";
import type {
  PettyCashFundReplenishmentFormErrors,
  PettyCashFundReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { parseAmount } from "@/app/src/utils/number.util";

const schema = z.object({
  transactionNo: z.string().regex(/^PCFR-\d{6}$/, "A valid PCFR No. is required."),
  documentDate: z.string().min(1, "Select a PCFR Date."),
  partyCode: z.string().trim().min(1, "Select a party."),
  partyName: z.string().trim().min(1, "Select a party."),
  accountCode: z.string().trim().min(1, "Select a default account."),
  accountTitle: z.string().trim().min(1, "Select a default account."),
});

export function validatePettyCashFundReplenishmentForm(values: PettyCashFundReplenishmentFormValues): PettyCashFundReplenishmentFormErrors {
  const errors: PettyCashFundReplenishmentFormErrors = {};
  const result = schema.safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as keyof PettyCashFundReplenishmentFormValues] ??= issue.message;
    }
  }
  if (
    values.entries.length === 0 ||
    values.entries.every((entry) => !entry.pettyCashNo.trim() && (parseAmount(entry.totalAmount) ?? 0) <= 0)
  ) {
    errors.entries = "Add at least one petty cash voucher entry.";
  } else if (
    values.entries.some(
      (entry) =>
        !entry.pettyCashNo.trim() || !entry.accountCode.trim() || !entry.accountTitle.trim() || (parseAmount(entry.totalAmount) ?? 0) <= 0,
    )
  ) {
    errors.entries = "Each entry needs a petty cash voucher, account, and amount greater than zero.";
  }
  const voucherNumbers = values.entries.map((entry) => entry.pettyCashNo.trim().toLowerCase()).filter(Boolean);
  if (new Set(voucherNumbers).size !== voucherNumbers.length) {
    errors.entries = "PCF numbers must be unique.";
  }
  return errors;
}

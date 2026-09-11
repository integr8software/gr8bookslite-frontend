import { z } from "zod";
import type {
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { PettyCashVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const draftSchema = z.object({
  transactionNo: z.string().regex(/^PCV-\d{6}$/, "PCV No. is required."),
  documentDate: z.string().min(1, "Select a PCV Date."),
});

const schema = z.object({
  transactionNo: z.string().regex(/^PCV-\d{6}$/, "PCV No. is required."),
  documentDate: z.string().min(1, "Select a PCV Date."),
  partyCode: z.string().trim().min(1, "Party Code is required."),
  partyName: z.string().trim().min(1, "Party Name is required."),
  accountCode: z.string().trim().min(1, "Select an account before submitting this Petty Cash Voucher."),
  accountTitle: z.string().trim().min(1, "Select an account before submitting this Petty Cash Voucher."),
});

export function validatePettyCashVoucherForm(values: PettyCashVoucherFormValues): PettyCashVoucherFormErrors {
  const errors: PettyCashVoucherFormErrors = {};
  const result = (values.status === PettyCashVoucherStatuses.Draft ? draftSchema : schema).safeParse(values);
  if (!result.success) for (const issue of result.error.issues) errors[issue.path[0] as keyof PettyCashVoucherFormValues] ??= issue.message;
  if (values.status === PettyCashVoucherStatuses.Draft) return errors;
  if (values.items.length === 0 || values.items.every((item) => !item.disbursementType.trim() && !item.supplierName.trim() && (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Add at least one petty cash item.";
  else if (values.items.some((item) => !item.disbursementType.trim() || !item.supplierName.trim() || (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Each item needs a Disbursement Type, Supplier, and an Amount greater than zero.";
  return errors;
}

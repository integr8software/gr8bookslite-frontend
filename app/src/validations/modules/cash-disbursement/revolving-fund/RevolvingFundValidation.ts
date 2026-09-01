import { z } from "zod";
import type {
  RevolvingFundFormErrors,
  RevolvingFundFormValues,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { RevolvingFundStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const draftSchema = z.object({
  transactionNo: z.string().regex(/^RF-\d{6}$/, "A valid RF No. is required."),
  documentDate: z.string().min(1, "Select an RF Date."),
});

const schema = z.object({
  transactionNo: z.string().regex(/^RF-\d{6}$/, "A valid RF No. is required."),
  documentDate: z.string().min(1, "Select an RF Date."),
  partyCode: z.string().trim().min(1, "Party Code is required."),
  partyName: z.string().trim().min(1, "Party Name is required."),
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.string().trim().min(1, "Default Account Title is required."),
});

export function validateRevolvingFundForm(values: RevolvingFundFormValues): RevolvingFundFormErrors {
  const errors: RevolvingFundFormErrors = {};
  const result = (values.status === RevolvingFundStatuses.draft ? draftSchema : schema).safeParse(values);
  if (!result.success) for (const issue of result.error.issues) errors[issue.path[0] as keyof RevolvingFundFormValues] ??= issue.message;
  if (values.status === RevolvingFundStatuses.draft) return errors;
  if (values.items.length === 0 || values.items.every((item) => !item.supplierName.trim() && (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Add at least one revolving fund item.";
  else if (values.items.some((item) => !item.supplierName.trim() || (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Each item needs a Supplier Name and an Amount greater than zero.";
  return errors;
}

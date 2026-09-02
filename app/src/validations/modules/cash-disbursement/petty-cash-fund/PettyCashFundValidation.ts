import { z } from "zod";
import type {
  PettyCashFundFormErrors,
  PettyCashFundFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { parseAmount } from "@/app/src/utils/number.util";

const draftSchema = z.object({
  transactionNo: z.string().regex(/^PCF-\d{6}$/, "PCF No. is required."),
  documentDate: z.string().min(1, "Select a PCF Date."),
});

const schema = z.object({
  transactionNo: z.string().regex(/^PCF-\d{6}$/, "PCF No. is required."),
  documentDate: z.string().min(1, "Select a PCF Date."),
  partyCode: z.string().trim().min(1, "Party Code is required."),
  partyName: z.string().trim().min(1, "Party Name is required."),
  accountCode: z.string().trim().min(1, "Default Account Code is required."),
  accountTitle: z.string().trim().min(1, "Default Account Title is required."),
});

export function validatePettyCashFundForm(values: PettyCashFundFormValues): PettyCashFundFormErrors {
  const errors: PettyCashFundFormErrors = {};
  const result = (values.status === PettyCashFundStatuses.draft ? draftSchema : schema).safeParse(values);
  if (!result.success) for (const issue of result.error.issues) errors[issue.path[0] as keyof PettyCashFundFormValues] ??= issue.message;
  if (values.status === PettyCashFundStatuses.draft) return errors;
  if (values.items.length === 0 || values.items.every((item) => !item.supplierName.trim() && (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Add at least one petty cash item.";
  else if (values.items.some((item) => !item.supplierName.trim() || (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Each item needs a Supplier Name and an Amount greater than zero.";
  return errors;
}

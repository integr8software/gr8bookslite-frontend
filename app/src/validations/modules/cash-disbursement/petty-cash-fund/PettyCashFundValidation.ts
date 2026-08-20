import { z } from "zod";
import type {
  PettyCashFundFormErrors,
  PettyCashFundFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { parseAmount } from "@/app/src/utils/number.util";

const schema = z.object({
  transactionNo: z.string().regex(/^PCF-\d{6}$/, "A valid PCF No. is required."),
  documentDate: z.string().min(1, "Select a PCF Date."),
  partyCode: z.string().trim().min(1, "Select a custodian."),
  partyName: z.string().trim().min(1, "Select a custodian."),
  accountCode: z.string().trim().min(1, "Select a default account."),
  accountTitle: z.string().trim().min(1, "Select a default account."),
});

export function validatePettyCashFundForm(values: PettyCashFundFormValues): PettyCashFundFormErrors {
  const errors: PettyCashFundFormErrors = {};
  const result = schema.safeParse(values);
  if (!result.success) for (const issue of result.error.issues) errors[issue.path[0] as keyof PettyCashFundFormValues] ??= issue.message;
  if (values.items.length === 0 || values.items.every((item) => !item.payeeName.trim() && (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Add at least one petty cash item.";
  else if (values.items.some((item) => !item.payeeName.trim() || (parseAmount(item.amount) ?? 0) <= 0))
    errors.items = "Each item needs a payee and an amount greater than zero.";
  return errors;
}

import { z } from "zod";
import type {
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentFormErrors,
  PettyCashFundReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);
const amount = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/,/g, "") : value),
  z.coerce.number().finite().min(0, "Enter a valid amount."),
);

export const PettyCashFundReplenishmentEntryValidationSchema = z.object({
  code: z.string(),
  id: z.string(),
  name: z.string(),
  netAmount: amount,
  pettyCashDate: z.string(),
  pettyCashNo: z.string(),
  remarks: z.string(),
  totalAmount: amount,
  vatAmount: amount,
});

export const PettyCashFundReplenishmentFormValidationSchema = z.object({
  documentDate: requiredText("Select a document date."),
  entries: z.array(PettyCashFundReplenishmentEntryValidationSchema).min(1),
  projectName: z.string(),
  projectRef: z.string(),
  remarks: z.string(),
  status: z.enum(["Active", "Pending", "Closed"]),
  transNo: requiredText("Enter a transaction number."),
  vceCode: requiredText("Enter a VCE code."),
  vceName: requiredText("Enter a VCE name."),
}).superRefine((values, context) => {
  const hasValidEntry = values.entries.some(
    (entry) =>
      entry.pettyCashNo.trim() &&
      entry.code.trim() &&
      entry.name.trim() &&
      Number(entry.totalAmount) > 0,
  );

  if (!hasValidEntry) {
    context.addIssue({
      code: "custom",
      message: "Add at least one entry with reference, code, name, and amount.",
      path: ["entries"],
    });
  }
});

export function validatePettyCashFundReplenishmentForm(
  values: PettyCashFundReplenishmentFormValues,
  entries: PettyCashFundReplenishmentEntry[],
): PettyCashFundReplenishmentFormErrors {
  const result = PettyCashFundReplenishmentFormValidationSchema.safeParse({
    ...values,
    entries,
  });

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<PettyCashFundReplenishmentFormErrors>(
    (errors, issue) => {
      const field = issue.path[0] as keyof PettyCashFundReplenishmentFormErrors;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );
}

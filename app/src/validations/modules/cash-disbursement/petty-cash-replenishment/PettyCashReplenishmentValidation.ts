import { z } from "zod";
import type {
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

const requiredText = (message: string) => z.string().trim().min(1, message);
const amount = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/,/g, "") : value),
  z.coerce.number().finite().min(0, "Enter a valid amount."),
);

export const PettyCashReplenishmentEntryValidationSchema = z.object({
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

export const PettyCashReplenishmentFormValidationSchema = z.object({
  documentDate: requiredText("Select a document date."),
  entries: z.array(PettyCashReplenishmentEntryValidationSchema).min(1),
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

export function validatePettyCashReplenishmentForm(
  values: PettyCashReplenishmentFormValues,
  entries: PettyCashReplenishmentEntry[],
): PettyCashReplenishmentFormErrors {
  const result = PettyCashReplenishmentFormValidationSchema.safeParse({
    ...values,
    entries,
  });

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<PettyCashReplenishmentFormErrors>(
    (errors, issue) => {
      const field = issue.path[0] as keyof PettyCashReplenishmentFormErrors;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );
}

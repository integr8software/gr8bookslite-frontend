import { z } from "zod";
import type {
  PostDatedCheckFormErrors,
  PostDatedCheckFormValues,
} from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";
const header = z.object({
  registryNo: z.string().trim().min(1, "Enter a PDC number."),
  registryDate: z.string().min(1, "Select a PDC date."),
  partyId: z.string().min(1, "Select a party."),
  type: z.enum(["Lodgment", "Release"], { message: "Select a type." }),
});
const detail = z.object({
  pdcDate: z.string().min(1, "Select a check date."),
  pdcBank: z.string().trim().min(1, "Enter the bank."),
  pdcNo: z.string().trim().min(1, "Enter the check number."),
  referenceNo: z.string().trim(),
  amount: z.number().positive("Enter an amount greater than zero."),
});
export function validatePostDatedCheck(values: PostDatedCheckFormValues): PostDatedCheckFormErrors {
  const errors: PostDatedCheckFormErrors = {};
  const result = header.safeParse(values);
  if (!result.success)
    result.error.issues.forEach((issue) => {
      errors[issue.path[0] as "registryNo" | "registryDate" | "partyId" | "type"] = issue.message;
    });
  if (!values.details.length) errors.details = "Add at least one PDC row.";
  const seen = new Set<string>();
  values.details.forEach((row) => {
    const rowResult = detail.safeParse(row);
    if (!rowResult.success) {
      errors.detailErrors ??= {};
      errors.detailErrors[row.id] ??= {};
      rowResult.error.issues.forEach((issue) => {
        errors.detailErrors![row.id][issue.path[0] as "pdcDate" | "pdcBank" | "pdcNo" | "referenceNo" | "amount"] = issue.message;
      });
    }
    const key = row.pdcNo.trim().toLowerCase();
    if (key && seen.has(key)) {
      errors.detailErrors ??= {};
      errors.detailErrors[row.id] = { ...errors.detailErrors[row.id], pdcNo: "Check number is duplicated in this registry." };
    }
    if (key) seen.add(key);
  });
  return errors;
}

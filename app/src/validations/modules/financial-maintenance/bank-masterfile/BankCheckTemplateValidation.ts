import { z } from "zod";
import type {
  BankCheckTemplateFormErrors,
  BankCheckTemplateFormValues,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";

const BankCheckTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required.").max(80, "Template name must be 80 characters or fewer."),
  description: z.string().trim().max(240, "Description must be 240 characters or fewer."),
  paperWidth: z.coerce.number().min(2, "Width must be at least 2 inches.").max(20, "Width must be 20 inches or fewer."),
  paperHeight: z.coerce.number().min(2, "Height must be at least 2 inches.").max(20, "Height must be 20 inches or fewer."),
  orientation: z.enum(["Landscape", "Portrait"]),
  isDefault: z.boolean(),
});

export function validateBankCheckTemplate(values: BankCheckTemplateFormValues): BankCheckTemplateFormErrors {
  const result = BankCheckTemplateSchema.safeParse(values);
  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<BankCheckTemplateFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof BankCheckTemplateFormValues;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
    return errors;
  }, {});
}

import { z } from "zod";
import {
  TermsMaintenanceDatemodeOptions,
  TermsMaintenanceStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import type {
  TermsMaintenanceFormErrors,
  TermsMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

const TermsMaintenanceFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(150, "Name must be 150 characters or fewer."),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
  datemode: z.enum(TermsMaintenanceDatemodeOptions, {
    message: "Select a datemode.",
  }),
  period: z
    .string()
    .trim()
    .min(1, "Enter a period.")
    .refine((value) => /^\d+$/.test(value), {
      message: "Enter a whole-number period of 0 or greater.",
    }),
  status: z.enum(TermsMaintenanceStatusOptions, {
    message: "Select a status.",
  }),
});

export function validateTermsMaintenanceForm(values: TermsMaintenanceFormValues): TermsMaintenanceFormErrors {
  const errors: TermsMaintenanceFormErrors = {};
  const result = TermsMaintenanceFormSchema.safeParse(values);

  if (result.success) {
    return errors;
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof TermsMaintenanceFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

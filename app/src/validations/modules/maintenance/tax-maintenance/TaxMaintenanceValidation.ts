import { z } from "zod";
import { TaxMaintenanceStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import type {
  TaxMaintenanceFormValues,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

export type TaxMaintenanceFormErrors = Partial<
  Record<keyof TaxMaintenanceFormValues, string>
>;

const RequiredAccountIdSchema = z.string().trim().min(1, "Select an account.");

export const TaxMaintenanceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tax name is required.")
    .max(120, "Tax name must be 120 characters or less."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less."),
  percentage: z
    .string()
    .trim()
    .min(1, "Percentage is required.")
    .refine((value) => Number.isFinite(Number(value)), {
      message: "Enter a valid percentage.",
    })
    .refine((value) => Number(value) >= 0 && Number(value) <= 100, {
      message: "Enter a percentage from 0 to 100.",
    })
    .refine((value) => hasAllowedDecimalPlaces(value, 4), {
      message: "Percentage can have up to 4 decimal places.",
    }),
  inputVatAccountId: RequiredAccountIdSchema,
  outputVatAccountId: RequiredAccountIdSchema,
  deferredVatAccountId: RequiredAccountIdSchema,
  expandedWithholdingTaxAccountId: RequiredAccountIdSchema,
  creditableWithholdingTaxAccountId: RequiredAccountIdSchema,
  withholdingVatableTaxAccountId: RequiredAccountIdSchema,
  finalWithholdingTaxAccountId: RequiredAccountIdSchema,
  status: z.enum(TaxMaintenanceStatusOptions, {
    error: "Select a valid status.",
  }),
});

export function validateTaxMaintenanceForm(
  values: TaxMaintenanceFormValues,
): TaxMaintenanceFormErrors {
  const parsed = TaxMaintenanceFormSchema.safeParse(values);

  if (parsed.success) {
    return {};
  }

  const errors: TaxMaintenanceFormErrors = {};

  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as keyof TaxMaintenanceFormValues | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

function hasAllowedDecimalPlaces(value: string, maxDecimalPlaces: number) {
  const decimalPart = value.split(".")[1];

  return !decimalPart || decimalPart.length <= maxDecimalPlaces;
}

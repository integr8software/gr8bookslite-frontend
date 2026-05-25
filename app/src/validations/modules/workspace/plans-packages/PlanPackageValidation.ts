import { z } from "zod";
import type {
  PlanPackageAddOnPricingRecord,
  PlanPackagePlanFormErrors,
  PlanPackagePlanFormValues,
  PlanPackagePricingFormErrors,
} from "@/app/src/types/modules/workspace/plans-packages/PlanPackageTypes";

const PlanPackagePlanFormSchema = z.object({
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  enabledModuleKeys: z
    .array(z.string())
    .min(1, "Enable at least one module for this plan."),
  includedUsers: z.number().int().min(1, "Included users must be at least 1."),
  monthlyPrice: z.number().min(0, "Monthly price cannot be negative."),
  status: z.enum(["Active", "Draft", "Inactive"]),
  yearlyPrice: z.number().min(0, "Yearly price cannot be negative."),
});

const PlanPackageAddOnSchema = z.object({
  monthlyPrice: z.number().min(0, "Monthly price cannot be negative."),
  yearlyPrice: z.number().min(0, "Yearly price cannot be negative."),
});

export function validatePlanPackagePlanForm(
  values: PlanPackagePlanFormValues,
) {
  const result = PlanPackagePlanFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return zodIssuesToErrors<PlanPackagePlanFormErrors>(result.error.issues);
}

export function validatePlanPackagePricingForm(
  addOns: PlanPackageAddOnPricingRecord[],
) {
  return addOns.reduce<PlanPackagePricingFormErrors>((errors, addOn) => {
    const result = PlanPackageAddOnSchema.safeParse(addOn);

    if (!result.success) {
      errors[addOn.code] = result.error.issues[0]?.message ?? "Invalid pricing.";
    }

    return errors;
  }, {});
}

function zodIssuesToErrors<TErrorShape>(issues: z.ZodIssue[]) {
  return issues.reduce<Record<string, string>>((errors, issue) => {
    const key = issue.path[0];

    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }

    return errors;
  }, {}) as TErrorShape;
}

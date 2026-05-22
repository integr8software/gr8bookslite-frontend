import { z } from "zod";
import type {
  PlanPackageAddOnPricingRecord,
  PlanPackageDiscountFormErrors,
  PlanPackageDiscountFormValues,
  PlanPackageDiscountRecord,
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
  status: z.enum(["Active", "Draft", "Archived"]),
  yearlyPrice: z.number().min(0, "Yearly price cannot be negative."),
});

const PlanPackageAddOnSchema = z.object({
  monthlyPrice: z.number().min(0, "Monthly price cannot be negative."),
  yearlyPrice: z.number().min(0, "Yearly price cannot be negative."),
});

const PlanPackageDiscountFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters.")
      .max(24, "Code must be 24 characters or less."),
    discountKind: z.enum(["Percent", "Fixed"]),
    expiresAt: z.string().trim().min(1, "Expiry date is required."),
    name: z.string().trim().min(3, "Name must be at least 3 characters."),
    status: z.enum(["Active", "Draft", "Archived"]),
    target: z.enum([
      "All Plans",
      "Accounting",
      "Inventory",
      "Accounting + Inventory",
      "Add-ons",
    ]),
    type: z.enum(["Promo", "Coupon", "Voucher"]),
    value: z.number().positive("Discount value must be greater than 0."),
  })
  .superRefine((values, context) => {
    if (values.discountKind === "Percent" && values.value > 100) {
      context.addIssue({
        code: "custom",
        message: "Percent discounts cannot exceed 100.",
        path: ["value"],
      });
    }
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

export function validatePlanPackageDiscountForm({
  discounts,
  editingDiscountId,
  values,
}: {
  discounts: PlanPackageDiscountRecord[];
  editingDiscountId: string | null;
  values: PlanPackageDiscountFormValues;
}) {
  const result = PlanPackageDiscountFormSchema.safeParse(values);
  const errors = result.success
    ? {}
    : zodIssuesToErrors<PlanPackageDiscountFormErrors>(result.error.issues);
  const normalizedCode = values.code.trim().toUpperCase();
  const hasDuplicateCode = discounts.some(
    (discount) =>
      discount.id !== editingDiscountId &&
      discount.code.trim().toUpperCase() === normalizedCode,
  );

  if (hasDuplicateCode) {
    errors.code = "A discount with this code already exists.";
  }

  return errors;
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

import { z } from "zod";
import type { WarehouseFormErrors, WarehouseFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export const WarehouseFormValidationSchema = z
  .object({
    code: z.string().trim().max(80, "Warehouse code must be 80 characters or fewer."),
    name: z.string().trim().min(1, "Enter a warehouse name.").max(180, "Warehouse name must be 180 characters or fewer."),
    branchUnitIds: z.array(z.string().regex(/^\d+$/, "Choose a valid branch.")),
    branchAvailabilityMode: z.enum(["All Branches", "Specific Branches", "Except Branches"]),
    availableBranches: z.array(z.string()),
    managerName: z.string().trim().max(180, "Manager name must be 180 characters or fewer."),
    status: z.enum(["Active", "Inactive"]),
    address: z.string().trim().min(1, "Enter the warehouse location.").max(500, "Warehouse location must be 500 characters or fewer."),
    contactNo: z.string().trim().max(40, "Contact number must be 40 characters or fewer."),
    description: z.string().trim().max(500, "Description must be 500 characters or fewer.").optional(),
  })
  .superRefine((values, context) => {
    if (values.branchAvailabilityMode === "Specific Branches" && values.branchUnitIds.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Choose at least one branch.",
        path: ["branchUnitIds"],
      });
    }
  });

export function validateWarehouseForm(values: WarehouseFormValues, options: { isWarehouseCodeRequired?: boolean } = {}) {
  const result = WarehouseFormValidationSchema.safeParse(values);
  const nextErrors: WarehouseFormErrors = {};

  if (options.isWarehouseCodeRequired && values.code.trim().length === 0) {
    nextErrors.code = "Enter a warehouse code.";
  }

  if (result.success) {
    return nextErrors;
  }

  return result.error.issues.reduce<WarehouseFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof WarehouseFormErrors | undefined;

    if (field) {
      errors[field] = issue.message;
    }

    return errors;
  }, nextErrors);
}

import { z } from "zod";
import {
  DisbursementTypeStatusOptions,
  DisbursementTypeTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import type {
  DisbursementTypeFormErrors,
  DisbursementTypeFormValues,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";

const DisbursementTypeTypeValues = DisbursementTypeTypeOptions.map((option) => option.value);

export const DisbursementTypeFormValidationSchema = z.object({
  type: z.enum(DisbursementTypeTypeValues, {
    message: "Disbursement Type Type is required.",
  }),
  disbursementTypeName: z
    .string()
    .trim()
    .min(1, "Disbursement Type Name is required.")
    .max(250, "Disbursement Type Name must be 250 characters or fewer."),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
  status: z.enum(DisbursementTypeStatusOptions, {
    message: "Status is required.",
  }),
  accountSetupMode: z.enum(["Existing", "Auto"], {
    message: "Account setup is required.",
  }),
  expenseCoaId: z.string(),
  expenseParentCoaId: z.string(),
}).superRefine((values, context) => {
  if (values.type !== "EXPENSE") {
    return;
  }

  if (values.accountSetupMode === "Existing" && !values.expenseCoaId.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Account Title is required.",
      path: ["expenseCoaId"],
    });
  }

  if (values.accountSetupMode === "Auto" && !values.expenseParentCoaId.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Sub Account is required.",
      path: ["expenseParentCoaId"],
    });
  }
});

export function validateDisbursementTypeForm(values: DisbursementTypeFormValues): DisbursementTypeFormErrors {
  const result = DisbursementTypeFormValidationSchema.safeParse(values);

  return result.success ? {} : mapDisbursementTypeIssues(result.error.issues);
}

function mapDisbursementTypeIssues(issues: z.ZodIssue[]) {
  return issues.reduce<DisbursementTypeFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof DisbursementTypeFormValues | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

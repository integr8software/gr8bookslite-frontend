import { z } from "zod";
import {
  DefaultAccountStatusOptions,
  DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import type {
  DefaultAccountFormErrors,
  DefaultAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";

const DefaultAccountTypeValues = DefaultAccountTypeOptions.map((option) => option.value);

export const DefaultAccountFormValidationSchema = z.object({
  type: z.enum(DefaultAccountTypeValues, {
    message: "Default Account Type is required.",
  }),
  defaultAccountName: z
    .string()
    .trim()
    .min(1, "Default Account Name is required.")
    .max(250, "Default Account Name must be 250 characters or fewer."),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
  status: z.enum(DefaultAccountStatusOptions, {
    message: "Status is required.",
  }),
  expenseParentCoaId: z.string(),
});

export function validateDefaultAccountForm(values: DefaultAccountFormValues): DefaultAccountFormErrors {
  const result = DefaultAccountFormValidationSchema.safeParse(values);

  return result.success ? {} : mapDefaultAccountIssues(result.error.issues);
}

function mapDefaultAccountIssues(issues: z.ZodIssue[]) {
  return issues.reduce<DefaultAccountFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof DefaultAccountFormValues | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

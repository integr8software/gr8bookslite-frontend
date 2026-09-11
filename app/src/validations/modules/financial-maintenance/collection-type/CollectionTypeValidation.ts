import { z } from "zod";
import {
  CollectionTypeAccountSetupModeOptions,
  CollectionTypeStatusOptions,
  CollectionTypeTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import type {
  CollectionTypeFormErrors,
  CollectionTypeFormValues,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";

const CollectionTypeTypeValues = CollectionTypeTypeOptions.map((option) => option.value);

export const CollectionTypeFormValidationSchema = z
  .object({
    type: z.enum(CollectionTypeTypeValues, {
      message: "Collection Type Type is required.",
    }),
    collectionTypeName: z
      .string()
      .trim()
      .min(1, "Collection Type Name is required.")
      .max(250, "Collection Type Name must be 250 characters or fewer."),
    description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
    status: z.enum(CollectionTypeStatusOptions, {
      message: "Status is required.",
    }),
    accountSetupMode: z.enum(CollectionTypeAccountSetupModeOptions),
    revenueCoaId: z.string(),
    expenseParentCoaId: z.string(),
  })
  .superRefine((values, context) => {
    if (values.accountSetupMode === "Existing" && !values.revenueCoaId.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account is required when selecting an existing account.",
        path: ["revenueCoaId"],
      });
    }
  });

export function validateCollectionTypeForm(values: CollectionTypeFormValues): CollectionTypeFormErrors {
  const result = CollectionTypeFormValidationSchema.safeParse(values);

  return result.success ? {} : mapCollectionTypeIssues(result.error.issues);
}

function mapCollectionTypeIssues(issues: z.ZodIssue[]) {
  return issues.reduce<CollectionTypeFormErrors>((errors, issue) => {
    const field = issue.path[0] as keyof CollectionTypeFormValues | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}
